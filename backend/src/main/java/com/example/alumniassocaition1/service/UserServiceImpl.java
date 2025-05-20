// --- File: com/example/alumniassocaition1/service/UserServiceImpl.java ---
package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.user.UserProfileDto;
import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import com.example.alumniassocaition1.dto.user.UserUpdateRequest;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.entity.UserFollow;
import com.example.alumniassocaition1.entity.UserFollowId;
import com.example.alumniassocaition1.exception.ResourceNotFoundException;
import com.example.alumniassocaition1.repository.UserFollowRepository;
import com.example.alumniassocaition1.repository.UserRepository;

import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class); // Added logger

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, UserFollowRepository userFollowRepository) {
        this.userRepository = userRepository;
        this.userFollowRepository = userFollowRepository;
    }

    // --- IMPLEMENTATION OF THE NEW METHOD ---
    @Override
    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            logger.warn("Attempt to get current authenticated user entity, but no valid authentication found.");
            throw new AccessDeniedException("User not authenticated. Cannot retrieve user entity.");
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal != null) {
            // This case might occur if the principal is just a String (e.g., from some token types not wrapped in UserDetails)
            email = principal.toString();
            logger.debug("Authentication principal is a String: {}", email);
        } else {
            logger.error("Authentication principal is null. This should not happen for an authenticated user.");
            throw new AccessDeniedException("Authentication principal is null. Cannot retrieve user entity.");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found with email from security context: {} (Principal type: {})", email, principal.getClass().getName());
                    return new UsernameNotFoundException("User not found with email from security context: " + email);
                });
    }

    // Implementation for UserDetailsService interface method
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase())));
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long userId) throws ResourceNotFoundException {
        User user = findUserById(userId); // Uses existing findUserById
        return mapUserToProfileDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile() {
        User currentUser = getCurrentAuthenticatedUserEntity(); // Use the new public method
        return mapUserToProfileDto(currentUser);
    }

    @Override
    @Transactional
    public UserProfileDto updateUserProfile(UserUpdateRequest updateRequest) {
        User currentUser = getCurrentAuthenticatedUserEntity(); // Use the new public method
        if (updateRequest.getName() != null) currentUser.setName(updateRequest.getName());
        if (updateRequest.getHeadline() != null) currentUser.setProfileHeadline(updateRequest.getHeadline());
        if (updateRequest.getLocation() != null) currentUser.setProfileLocation(updateRequest.getLocation());
        if (updateRequest.getAbout() != null) currentUser.setProfileAbout(updateRequest.getAbout());
        // Handle profilePictureUrl if it's part of UserUpdateRequest and needs special handling

        User updatedUser = userRepository.save(currentUser);
        return mapUserToProfileDto(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getFollowers(Long userId) throws ResourceNotFoundException {
        User user = findUserById(userId);
        return userFollowRepository.findByIdFollowingId(user.getUserId()).stream()
                .map(UserFollow::getFollower)
                .map(this::mapUserToSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getFollowing(Long userId) throws ResourceNotFoundException {
        User user = findUserById(userId);
        return userFollowRepository.findByIdFollowerId(user.getUserId()).stream()
                .map(UserFollow::getFollowing)
                .map(this::mapUserToSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void followUser(Long userIdToFollow) throws ResourceNotFoundException {
        User currentUser = getCurrentAuthenticatedUserEntity(); // Use the new public method
        User userToFollow = findUserById(userIdToFollow);

        if (currentUser.getUserId().equals(userToFollow.getUserId())) {
            throw new IllegalArgumentException("Cannot follow yourself.");
        }

        UserFollowId followId = new UserFollowId(currentUser.getUserId(), userToFollow.getUserId());
        if (userFollowRepository.existsById(followId)) {
            logger.debug("User {} already follows user {}. No action taken.", currentUser.getUserId(), userIdToFollow);
            return; // Already following
        }

        UserFollow userFollow = new UserFollow();
        userFollow.setId(followId);
        userFollow.setFollower(currentUser);
        userFollow.setFollowing(userToFollow);
        userFollowRepository.save(userFollow);
        logger.info("User {} successfully followed user {}.", currentUser.getUserId(), userIdToFollow);
    }

    @Override
    @Transactional
    public void unfollowUser(Long userIdToUnfollow) throws ResourceNotFoundException {
        User currentUser = getCurrentAuthenticatedUserEntity(); // Use the new public method
        User userToUnfollow = findUserById(userIdToUnfollow);
        UserFollowId followId = new UserFollowId(currentUser.getUserId(), userToUnfollow.getUserId());

        if (!userFollowRepository.existsById(followId)) {
            logger.debug("User {} is not following user {}. No action taken for unfollow.", currentUser.getUserId(), userIdToUnfollow);
            return; // Not following, or trying to unfollow someone not followed
        }
        userFollowRepository.deleteById(followId);
        logger.info("User {} successfully unfollowed user {}.", currentUser.getUserId(), userIdToUnfollow);
    }

    @Override
    @Transactional(readOnly = true)
    public User findUserById(Long userId) throws ResourceNotFoundException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    @Override
    @Transactional(readOnly = true)
    public User findUserByEmail(String email) throws ResourceNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private UserProfileDto mapUserToProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        BeanUtils.copyProperties(user, dto);
        dto.setId(user.getUserId());
        dto.setProfilePictureUrl(user.getProfilePictureUrl()); // Ensure this is mapped
        dto.setFollowersCount(userFollowRepository.countByIdFollowingId(user.getUserId()));
        dto.setFollowingCount(userFollowRepository.countByIdFollowerId(user.getUserId()));
        // Ensure other fields like name, email, role, headline, location, about are correctly copied by BeanUtils
        // or set them explicitly if needed.
        return dto;
    }

    private UserSummaryDto mapUserToSummaryDto(User user) {
        UserSummaryDto dto = new UserSummaryDto();
        BeanUtils.copyProperties(user, dto);
        dto.setId(user.getUserId());
        // Ensure role and status are copied if UserSummaryDto needs them
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus()); // Assuming UserSummaryDto has status
        return dto;
    }
}