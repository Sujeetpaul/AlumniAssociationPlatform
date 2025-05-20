package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.EventDto;
import com.example.alumniassocaition1.dto.EventCreateRequest;
import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import com.example.alumniassocaition1.entity.Event;
import com.example.alumniassocaition1.entity.EventAttendee;
import com.example.alumniassocaition1.entity.EventAttendeeId;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.entity.College;
import com.example.alumniassocaition1.exception.ResourceNotFoundException;
import com.example.alumniassocaition1.repository.EventAttendeeRepository;
import com.example.alumniassocaition1.repository.EventRepository;
import com.example.alumniassocaition1.repository.CollegeRepository; // Assuming you might need it

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
// import org.springframework.web.multipart.MultipartFile; // Not used in this snippet
// import org.springframework.web.servlet.support.ServletUriComponentsBuilder; // For image URLs

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventServiceImpl.class);

    private final EventRepository eventRepository;
    private final EventAttendeeRepository eventAttendeeRepository;
    private final UserService userService; // Assuming this has getCurrentAuthenticatedUserEntity()
    private final FileStorageService fileStorageService; // For deleting images
    private final CollegeRepository collegeRepository; // For college-related operations if any

    @Autowired
    public EventServiceImpl(EventRepository eventRepository,
                            EventAttendeeRepository eventAttendeeRepository,
                            UserService userService,
                            FileStorageService fileStorageService,
                            CollegeRepository collegeRepository) {
        this.eventRepository = eventRepository;
        this.eventAttendeeRepository = eventAttendeeRepository;
        this.userService = userService;
        this.fileStorageService = fileStorageService;
        this.collegeRepository = collegeRepository;
    }

    // Helper to get current user entity (ensure this is robust in your UserService)
    private User getCurrentUserEntity() {
        try {
            return userService.getCurrentAuthenticatedUserEntity();
        } catch (AccessDeniedException | ResourceNotFoundException e) {
            logger.warn("Attempt to get current user entity failed or user not found: {}", e.getMessage());
            return null;
        }
    }


    @Override
    @Transactional(readOnly = true)
    public List<EventDto> getAllEvents() {
        User currentUser = getCurrentUserEntity();
        List<Event> events;

        // Your existing logic for fetching events based on user's college or all events
        if (currentUser != null && currentUser.getCollege() != null) {
            logger.info("Fetching events for user {} from college ID: {}", currentUser.getUserId(), currentUser.getCollege().getCollegeId());
            events = eventRepository.findByCollegeCollegeIdOrderByEventDateDesc(currentUser.getCollege().getCollegeId());
        } else if (currentUser != null && "admin".equalsIgnoreCase(currentUser.getRole()) && currentUser.getCollege() == null) {
            logger.info("Super admin {} fetching all events.", currentUser.getUserId());
            events = eventRepository.findAllByOrderByEventDateDesc();
        } else {
            logger.info("Fetching all events for unauthenticated user or user with no college affiliation.");
            events = eventRepository.findAllByOrderByEventDateDesc();
        }

        return events.stream()
                .map(event -> mapEventToDto(event, currentUser))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EventDto getEventById(Long eventId) throws ResourceNotFoundException {
        User currentUser = getCurrentUserEntity();
        logger.info("getEventById: Fetching event {} for current user (ID: {}).", eventId, currentUser != null ? currentUser.getUserId() : "null");

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        // Your existing college visibility check logic
        if (currentUser != null && currentUser.getCollege() != null &&
                event.getCollege() != null &&
                !currentUser.getCollege().getCollegeId().equals(event.getCollege().getCollegeId())) {
            boolean isSuperAdmin = "admin".equalsIgnoreCase(currentUser.getRole()) && currentUser.getCollege() == null;
            if (!"admin".equalsIgnoreCase(currentUser.getRole()) || (currentUser.getCollege() != null && !isSuperAdmin)) {
                logger.warn("User {} from college {} attempted to access event {} from different college {}.",
                        currentUser.getUserId(), currentUser.getCollege().getCollegeId(), eventId, event.getCollege().getCollegeId());
                throw new AccessDeniedException("You do not have permission to view this event from another college.");
            }
        }
        return mapEventToDto(event, currentUser);
    }

    @Override
    @Transactional
    public EventDto createAndSaveEvent(Event event, User creator) { // Assuming creator is passed
        if (creator == null) {
            throw new AccessDeniedException("User must be authenticated to create/save an event.");
        }
        if (event.getCreatedBy() == null) {
            event.setCreatedBy(creator);
        }
        if (creator.getCollege() == null) {
            logger.error("User {} attempting to create/save event but is not associated with a college.", creator.getUserId());
            throw new IllegalStateException("User creating/saving event must be associated with a college.");
        }
        event.setCollege(creator.getCollege());

        Event savedEvent = eventRepository.save(event);
        logger.info("Event saved/updated successfully with ID: {}", savedEvent.getEventId());
        return mapEventToDto(savedEvent, creator); // Pass creator as currentUser for initial DTO mapping
    }

    @Override
    @Transactional
    public EventDto createEventFromDto(EventCreateRequest createRequestDto, User currentUser) {
        if (currentUser == null) throw new AccessDeniedException("User must be authenticated.");
        if (!("alumnus".equalsIgnoreCase(currentUser.getRole()) || "admin".equalsIgnoreCase(currentUser.getRole()))) {
            throw new AccessDeniedException("User does not have permission to create events.");
        }
        if (currentUser.getCollege() == null) {
            throw new IllegalStateException("User creating event is not associated with a college.");
        }
        Event event = new Event();
        event.setTitle(createRequestDto.getTitle());
        event.setDescription(createRequestDto.getDescription());
        event.setEventDate(createRequestDto.getDate());
        event.setLocation(createRequestDto.getLocation());
        event.setCreatedBy(currentUser);
        event.setCollege(currentUser.getCollege()); // Default to creator's college
        event.setImageUrl(null); // Assuming image handling is separate or via createAndSaveEvent

        Event savedEvent = eventRepository.save(event);
        return mapEventToDto(savedEvent, currentUser);
    }

    @Override
    @Transactional
    public EventDto updateEventFromDto(Long eventId, EventCreateRequest updateRequestDto, User currentUser) throws ResourceNotFoundException {
        if (currentUser == null) throw new AccessDeniedException("User must be authenticated.");
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        boolean isAdminOfEventCollege = "admin".equalsIgnoreCase(currentUser.getRole()) &&
                currentUser.getCollege() != null &&
                event.getCollege() != null &&
                currentUser.getCollege().getCollegeId().equals(event.getCollege().getCollegeId());
        boolean isSuperAdmin = "admin".equalsIgnoreCase(currentUser.getRole()) && currentUser.getCollege() == null;

        if (!(event.getCreatedBy().getUserId().equals(currentUser.getUserId()) || isAdminOfEventCollege || isSuperAdmin )) {
            throw new AccessDeniedException("User does not have permission to update this event.");
        }

        event.setTitle(updateRequestDto.getTitle());
        event.setDescription(updateRequestDto.getDescription());
        event.setEventDate(updateRequestDto.getDate());
        event.setLocation(updateRequestDto.getLocation());

        // College update logic (if applicable)
        if (updateRequestDto.getCollegeId() != null && "admin".equalsIgnoreCase(currentUser.getRole())) {
            College targetCollege = collegeRepository.findById(updateRequestDto.getCollegeId())
                    .orElseThrow(() -> new ResourceNotFoundException("College", "id", updateRequestDto.getCollegeId()));
            if (isSuperAdmin || (currentUser.getCollege() != null && currentUser.getCollege().getCollegeId().equals(targetCollege.getCollegeId()))) {
                event.setCollege(targetCollege);
            } else {
                logger.warn("Admin {} attempted to change event {} college to {} without sufficient privilege.", currentUser.getUserId(), eventId, targetCollege.getCollegeId());
            }
        }

        Event updatedEvent = eventRepository.save(event);
        return mapEventToDto(updatedEvent, currentUser);
    }


    @Override
    @Transactional(readOnly = true)
    public Event findEventEntityById(Long eventId) throws ResourceNotFoundException {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
    }

    @Override
    @Transactional
    public void deleteEvent(Long eventId) throws ResourceNotFoundException {
        User currentUser = getCurrentUserEntity();
        if (currentUser == null) throw new AccessDeniedException("Authentication required.");
        Event event = findEventEntityById(eventId);

        boolean isAdminOfEventCollege = "admin".equalsIgnoreCase(currentUser.getRole()) &&
                currentUser.getCollege() != null &&
                event.getCollege() != null &&
                currentUser.getCollege().getCollegeId().equals(event.getCollege().getCollegeId());
        boolean isSuperAdmin = "admin".equalsIgnoreCase(currentUser.getRole()) && currentUser.getCollege() == null;
        boolean isCreator = event.getCreatedBy().getUserId().equals(currentUser.getUserId());

        if (!(isCreator || isAdminOfEventCollege || isSuperAdmin)) {
            throw new AccessDeniedException("User does not have permission to delete this event.");
        }

        String imageUrl = event.getImageUrl();
        eventRepository.delete(event); // Cascades to EventAttendee due to orphanRemoval=true

        if (StringUtils.hasText(imageUrl)) {
            try {
                String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                if (!fileName.isEmpty()) {
                    fileStorageService.deleteFile(fileName);
                }
            } catch (Exception e) {
                logger.error("Could not delete event image file: {}. Error: {}", imageUrl, e.getMessage());
            }
        }
        logger.info("Event ID {} deleted by User ID {}.", eventId, currentUser.getUserId());
    }

    @Override
    @Transactional
    public void joinEvent(Long eventId) throws ResourceNotFoundException {
        User currentUser = getCurrentUserEntity();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to join an event.");
        }
        // Students and Alumni can join. Admins typically don't "join" events this way.
        if ("admin".equalsIgnoreCase(currentUser.getRole())) {
            logger.warn("Admin user {} attempted to join event {} via standard join mechanism.", currentUser.getUserId(), eventId);
            // throw new AccessDeniedException("Admins cannot join events through this action.");
            // Or allow it if admins can also be attendees. For now, let's assume they can.
        }


        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        EventAttendeeId eventAttendeeId = new EventAttendeeId(event.getEventId(), currentUser.getUserId());

        if (eventAttendeeRepository.existsById(eventAttendeeId)) {
            logger.info("User {} already attending event {}. No action taken.", currentUser.getUserId(), eventId);
            return; // Already attending
        }

        EventAttendee eventAttendee = new EventAttendee();
        eventAttendee.setId(eventAttendeeId);
        eventAttendee.setEvent(event);
        eventAttendee.setUser(currentUser);
        // 'joinedAt' is set by @PrePersist in EventAttendee entity

        eventAttendeeRepository.save(eventAttendee);
        logger.info("User {} successfully joined event {}.", currentUser.getUserId(), eventId);
    }

    @Override
    @Transactional
    public void leaveEvent(Long eventId) throws ResourceNotFoundException {
        User currentUser = getCurrentUserEntity();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated to leave an event.");
        }

        EventAttendeeId eventAttendeeId = new EventAttendeeId(eventId, currentUser.getUserId());

        if (!eventAttendeeRepository.existsById(eventAttendeeId)) {
            logger.info("User {} is not attending event {}. No action taken for leaving.", currentUser.getUserId(), eventId);
            // Optionally, throw an exception if trying to leave an event not joined,
            // or just return silently. For robustness, silent return is fine.
            // throw new ResourceNotFoundException("EventAttendee", "eventId/userId", eventId + "/" + currentUser.getUserId());
            return;
        }

        eventAttendeeRepository.deleteById(eventAttendeeId);
        logger.info("User {} successfully left event {}.", currentUser.getUserId(), eventId);
    }

    private EventDto mapEventToDto(Event event, User currentUser) {
        EventDto dto = new EventDto();
        dto.setId(event.getEventId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setDate(event.getEventDate());
        dto.setLocation(event.getLocation());
        dto.setImageUrl(event.getImageUrl());
        dto.setCreatedAt(event.getCreatedAt());

        if (event.getCreatedBy() != null) {
            UserSummaryDto creatorDto = new UserSummaryDto();
            // BeanUtils.copyProperties(event.getCreatedBy(), creatorDto); // Careful with this, ensure UserSummaryDto fields match User fields
            creatorDto.setId(event.getCreatedBy().getUserId());
            creatorDto.setName(event.getCreatedBy().getName() != null ? event.getCreatedBy().getName() : "Unknown Creator");
            creatorDto.setEmail(event.getCreatedBy().getEmail()); // Assuming UserSummaryDto has email
            creatorDto.setRole(event.getCreatedBy().getRole());   // Assuming UserSummaryDto has role
            dto.setCreatedBy(creatorDto);
        } else {
            UserSummaryDto unknownCreator = new UserSummaryDto();
            unknownCreator.setName("Unknown Creator");
            dto.setCreatedBy(unknownCreator);
        }

        if (event.getCollege() != null) {
            dto.setCollegeId(event.getCollege().getCollegeId());
        }

        if (event.getAttendees() != null) {
            dto.setAttendees(event.getAttendees().stream().map(ea -> {
                UserSummaryDto attendeeUserDto = new UserSummaryDto();
                if (ea.getUser() != null) {
                    // BeanUtils.copyProperties(ea.getUser(), attendeeUserDto);
                    attendeeUserDto.setId(ea.getUser().getUserId());
                    attendeeUserDto.setName(ea.getUser().getName());
                    attendeeUserDto.setEmail(ea.getUser().getEmail());
                    attendeeUserDto.setRole(ea.getUser().getRole());
                }
                return attendeeUserDto;
            }).collect(Collectors.toList()));
        } else {
            dto.setAttendees(Collections.emptyList());
        }

        // --- Crucial part for isAttending ---
        boolean isAttending = false;
        if (currentUser != null && event.getEventId() != null && currentUser.getUserId() != null) {
            // Log the parameters being passed to the repository method
            logger.debug("mapEventToDto: Checking attendance for eventId: {}, userId: {}", event.getEventId(), currentUser.getUserId());
            isAttending = eventAttendeeRepository.existsByIdEventIdAndIdUserId(event.getEventId(), currentUser.getUserId());
            logger.debug("mapEventToDto: eventAttendeeRepository.existsByIdEventIdAndIdUserId returned: {}", isAttending);
        } else {
            logger.debug("mapEventToDto: currentUser, eventId, or currentUserId is null. Defaulting isAttending to false. User: {}, EventID: {}",
                    currentUser != null ? currentUser.getUserId() : "null",
                    event.getEventId());
        }
        dto.setAttending(isAttending);
        logger.debug("mapEventToDto: Final DTO for eventId {}: isAttending = {}", event.getEventId(), dto.isAttending());
        // --- End crucial part ---

        return dto;
    }
}

