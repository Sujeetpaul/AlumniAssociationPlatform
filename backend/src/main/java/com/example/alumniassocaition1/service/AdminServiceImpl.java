package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.user.AdminUserCreateRequest;
import com.example.alumniassocaition1.dto.user.UserStatusUpdateRequest;
import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import com.example.alumniassocaition1.entity.*;
import com.example.alumniassocaition1.exception.ResourceNotFoundException;
import com.example.alumniassocaition1.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    private final UserFollowRepository userFollowRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final DonationRepository donationRepository;
    private final EventAttendeeRepository eventAttendeeRepository;
    private final PostLikeRepository postLikeRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public AdminServiceImpl(UserRepository userRepository, EventRepository eventRepository, UserService userService,
                            PasswordEncoder passwordEncoder, UserFollowRepository userFollowRepository,
                            PostRepository postRepository, CommentRepository commentRepository,
                            DonationRepository donationRepository, EventAttendeeRepository eventAttendeeRepository,
                            PostLikeRepository postLikeRepository, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.userFollowRepository = userFollowRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.donationRepository = donationRepository;
        this.eventAttendeeRepository = eventAttendeeRepository;
        this.postLikeRepository = postLikeRepository;
        this.fileStorageService = fileStorageService;
    }

    private User getCurrentAdminUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            logger.warn("Attempt to get current admin user without authentication principal.");
            throw new AccessDeniedException("User authentication not found.");
        }
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails)principal).getUsername();
        } else if (principal != null) {
            username = principal.toString();
        } else {
            throw new AccessDeniedException("User authentication principal is null.");
        }

        User adminUserEntity;
        try {
            adminUserEntity = userService.findUserByEmail(username);
        } catch (ResourceNotFoundException e) {
            logger.error("Authenticated admin user with email {} not found in database.", username, e);
            throw new AccessDeniedException("Admin user details not found, cannot perform admin actions.");
        }

        if (!"admin".equalsIgnoreCase(adminUserEntity.getRole())) {
            logger.warn("User {} with role {} attempted an admin action but is not an admin.", username, adminUserEntity.getRole());
            throw new AccessDeniedException("User is not an admin.");
        }
        return adminUserEntity;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllUsersForAdminCollege() {
        User adminUser = getCurrentAdminUser();
        College adminCollege = adminUser.getCollege();

        if (adminCollege == null) {
            logger.error("Admin user {} (ID: {}) is not associated with any college. Cannot fetch managed users.",
                    adminUser.getName(), adminUser.getUserId());
            throw new IllegalStateException("Admin user is not associated with a college.");
        }

        logger.info("Fetching users for admin {} (ID: {}) from college ID: {}",
                adminUser.getName(), adminUser.getUserId(), adminCollege.getCollegeId());

        List<User> usersInCollege = userRepository.findByCollegeCollegeId(adminCollege.getCollegeId());

        return usersInCollege.stream()
                .filter(user -> !user.getUserId().equals(adminUser.getUserId()))
                .map(this::mapUserToSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserSummaryDto adminAddUser(AdminUserCreateRequest createRequest) {
        // ... (implementation from previous correct version)
        User adminUser = getCurrentAdminUser();
        College adminCollege = adminUser.getCollege();
        if (adminCollege == null) {
            throw new IllegalStateException("Admin user is not associated with a college to add new users to.");
        }
        if (userRepository.existsByEmail(createRequest.getEmail())) {
            throw new IllegalArgumentException("User with email " + createRequest.getEmail() + " already exists.");
        }
        User newUser = new User();
        newUser.setName(createRequest.getName());
        newUser.setEmail(createRequest.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(createRequest.getPassword()));
        newUser.setRole(createRequest.getRole());
        newUser.setStatus(createRequest.getStatus() != null ? createRequest.getStatus().toLowerCase() : "active");
        newUser.setCollege(adminCollege);
        User savedUser = userRepository.save(newUser);
        return mapUserToSummaryDto(savedUser);
    }

    @Override
    @Transactional
    public void adminRemoveUser(Long userId) throws ResourceNotFoundException {
        logger.info("Admin attempting to remove user with ID: {}", userId);
        User adminUser = getCurrentAdminUser();
        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Authorization checks
        if (userToRemove.getUserId().equals(adminUser.getUserId())) {
            throw new AccessDeniedException("Admin cannot remove themselves.");
        }
        if (userToRemove.getCollege() == null || adminUser.getCollege() == null ||
                !userToRemove.getCollege().getCollegeId().equals(adminUser.getCollege().getCollegeId())) {
            throw new AccessDeniedException("Admin cannot remove users from other colleges.");
        }

        logger.info("Proceeding to remove related entities for user ID: {}", userId);

        // 1. Remove from user_follows
        userFollowRepository.deleteByIdFollowerId(userId);
        userFollowRepository.deleteByIdFollowingId(userId);
        logger.info("Removed follow relationships for user ID: {}", userId);

        // 2. Remove PostLikes made by the user (distinct from likes on their posts)
        postLikeRepository.deleteByIdUserId(userId);
        logger.info("Removed post likes made by user {}.", userId);

        // 3. Remove EventAttendances by the user
        eventAttendeeRepository.deleteByIdUserId(userId);
        logger.info("Removed event attendances for user {}.", userId);

        // 4. Comments authored by the user (on any post)
        List<Comment> commentsAuthored = commentRepository.findByAuthorUserId(userId);
        if (!commentsAuthored.isEmpty()) {
            commentRepository.deleteAllInBatch(commentsAuthored);
            logger.info("Deleted {} comments authored by user {}.", commentsAuthored.size(), userId);
        }

        // 5. Posts authored by the user
        List<Post> postsAuthored = postRepository.findByAuthorUserIdOrderByCreatedAtDesc(userId);
        if (!postsAuthored.isEmpty()) {
            logger.info("Found {} posts authored by user {}. Deleting them individually to trigger cascades.", postsAuthored.size(), userId);
            for (Post post : postsAuthored) {
                if (StringUtils.hasText(post.getImageUrl())) {
                    try {
                        String fileName = post.getImageUrl().substring(post.getImageUrl().lastIndexOf("/") + 1);
                        if (!fileName.isEmpty()) this.fileStorageService.deleteFile(fileName);
                    } catch (Exception e) { logger.error("Error deleting image for post {}: {}", post.getPostId(), e.getMessage());}
                }
                // Deleting post individually should trigger CascadeType.ALL for its likes and comments
                postRepository.delete(post);
                logger.info("Deleted post ID: {}", post.getPostId());
            }
            logger.info("Finished deleting posts authored by user {}.", userId);
        }

        // 6. Events created by the user
        List<Event> eventsCreated = eventRepository.findByCreatedByUserId(userId);
        if (!eventsCreated.isEmpty()) {
            for (Event event : eventsCreated) {
                if (StringUtils.hasText(event.getImageUrl())) {
                    try {
                        String fileName = event.getImageUrl().substring(event.getImageUrl().lastIndexOf("/") + 1);
                        if (!fileName.isEmpty()) this.fileStorageService.deleteFile(fileName);
                    } catch (Exception e) { logger.error("Error deleting image for event {}: {}", event.getEventId(), e.getMessage());}
                }
                eventRepository.delete(event); // Should cascade to EventAttendees
                logger.info("Deleted event ID: {}", event.getEventId());
            }
            logger.info("Deleted {} events created by user {}.", eventsCreated.size(), userId);
        }

        // 7. Donations made by the user
        List<Donation> donationsMade = donationRepository.findByUserUserId(userId);
        if (!donationsMade.isEmpty()) {
            donationRepository.deleteAllInBatch(donationsMade);
            logger.info("Deleted {} donations made by user {}.", donationsMade.size(), userId);
        }

        // Finally, delete the user
        userRepository.delete(userToRemove);
        logger.info("Successfully removed user with ID: {}", userId);
    }

    @Override
    @Transactional
    public UserSummaryDto adminUpdateUserStatus(Long userId, UserStatusUpdateRequest statusUpdateRequest) throws ResourceNotFoundException {
        // ... (implementation from your previous correct version)
        User adminUser = getCurrentAdminUser();
        User userToUpdate = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (userToUpdate.getUserId().equals(adminUser.getUserId())) {
            throw new AccessDeniedException("Admin cannot update their own status through this interface.");
        }
        if (userToUpdate.getCollege() == null || adminUser.getCollege() == null || !userToUpdate.getCollege().getCollegeId().equals(adminUser.getCollege().getCollegeId())) {
            throw new AccessDeniedException("Admin cannot update status for users from other colleges.");
        }
        String newStatus = statusUpdateRequest.getStatus();
        if (!("active".equalsIgnoreCase(newStatus) || "inactive".equalsIgnoreCase(newStatus))) {
            throw new IllegalArgumentException("Invalid status value: " + newStatus + ". Must be 'active' or 'inactive'.");
        }
        userToUpdate.setStatus(newStatus.toLowerCase());
        User updatedUser = userRepository.save(userToUpdate);
        return mapUserToSummaryDto(updatedUser);
    }

    @Override
    @Transactional
    public void adminRemoveEvent(Long eventId) throws ResourceNotFoundException {
        // ... (implementation from your previous correct version)
        User adminUser = getCurrentAdminUser();
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        if (event.getCollege() == null || adminUser.getCollege() == null || !event.getCollege().getCollegeId().equals(adminUser.getCollege().getCollegeId())) {
            throw new AccessDeniedException("Admin can only remove events from their own college.");
        }
        if (StringUtils.hasText(event.getImageUrl())) {
            try { String fileName = event.getImageUrl().substring(event.getImageUrl().lastIndexOf("/") + 1); if (!fileName.isEmpty()) this.fileStorageService.deleteFile(fileName); }
            catch (Exception e) { logger.error("Could not delete image file for event {}: {}", event.getEventId(), e.getMessage()); }
        }
        eventRepository.delete(event);
    }

    private UserSummaryDto mapUserToSummaryDto(User user) {
        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        return dto;
    }
}
