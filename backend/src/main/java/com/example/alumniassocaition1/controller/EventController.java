package com.example.alumniassocaition1.controller;

import com.example.alumniassocaition1.dto.ApiResponse;
import com.example.alumniassocaition1.dto.EventDto;
import com.example.alumniassocaition1.dto.EventCreateRequest; // For JSON endpoint
import com.example.alumniassocaition1.entity.Event;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.exception.MyFileNotFoundException;
import com.example.alumniassocaition1.service.EventService;
import com.example.alumniassocaition1.service.FileStorageService;
import com.example.alumniassocaition1.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    @Autowired
    private EventService eventService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserService userService;

    // --- GET, DELETE, JOIN/LEAVE (remain same) ---
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<EventDto>> getAllEvents() { /* ... */ return ResponseEntity.ok(eventService.getAllEvents()); }

    @GetMapping("/{eventId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long eventId) { /* ... */ return ResponseEntity.ok(eventService.getEventById(eventId)); }


    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAnyRole('ALUMNUS', 'ADMIN')")
    public ResponseEntity<?> createEventWithIndividualParts(
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("date") String dateStr, // Expecting "YYYY-MM-DD"
            @RequestPart("time") String timeStr, // Expecting "HH:MM" or "HH:MM:SS"
            @RequestPart("location") String location,
            @RequestPart(value = "collegeId", required = false) String collegeIdStr,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        logger.info("MULTIPART POST /api/events hit. Title: [{}], DateStr: [{}], TimeStr: [{}]", title, dateStr, timeStr);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        User currentUser = userService.findUserByEmail(userPrincipal.getUsername());

        // Basic Validations
        if (!StringUtils.hasText(title)) return ResponseEntity.badRequest().body(new ApiResponse(false, "Title must not be blank."));
        // ... other similar validations for description, location, dateStr, timeStr ...

        LocalDateTime eventDateTime;
        try {
            // LocalDate.parse() correctly handles "YYYY-MM-DD" by default (ISO_LOCAL_DATE)
            LocalDate parsedDate = LocalDate.parse(dateStr);

            // LocalTime.parse() correctly handles "HH:MM" and "HH:MM:SS" by default
            LocalTime parsedTime = LocalTime.parse(timeStr);

            eventDateTime = LocalDateTime.of(parsedDate, parsedTime);

            if (eventDateTime.isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Event date and time must be in the future."));
            }
        } catch (DateTimeParseException e) {
            logger.error("Invalid date/time format: date='{}', time='{}'. Error: {}", dateStr, timeStr, e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid date or time format. Date should be YYYY-MM-DD, Time should be HH:MM or HH:MM:SS."));
        }

        Event event = new Event();
        event.setTitle(title);
        event.setDescription(description);
        event.setEventDate(eventDateTime);
        event.setLocation(location);
        event.setCreatedBy(currentUser);
        event.setCollege(currentUser.getCollege()); // Default

        // Handle collegeIdStr if provided (simplified for example)
        if (StringUtils.hasText(collegeIdStr)) {
            try { Long.parseLong(collegeIdStr); /* Further logic to set college by ID if needed */ }
            catch (NumberFormatException e) { logger.warn("Invalid collegeIdStr: {}", collegeIdStr); }
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String fileName = fileStorageService.storeFile(imageFile);
                String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/events/uploads/").path(fileName).toUriString();
                event.setImageUrl(fileDownloadUri);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(false, "Failed to upload image: " + e.getMessage()));
            }
        }

        EventDto savedEventDto = eventService.createAndSaveEvent(event, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEventDto);
    }

    // JSON-only POST endpoint (using EventCreateRequest DTO)
    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ALUMNUS', 'ADMIN')")
    public ResponseEntity<EventDto> createEventWithJson(@Valid @RequestBody EventCreateRequest createRequestDto) {
        // ... (implementation using createRequestDto)
        // This would call a service method like eventService.createEventFromDto(...)
        User currentUser = userService.findUserByEmail(((UserDetails)SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername());
        EventDto newEvent = eventService.createEventFromDto(createRequestDto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(newEvent);
    }


    // PUT for multipart (similar changes for dateTime parsing)
    @PutMapping(value = "/{eventId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateEventWithIndividualParts(
            @PathVariable Long eventId,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("date") String dateStr,
            @RequestPart("time") String timeStr,
            @RequestPart("location") String location,
            @RequestPart(value = "collegeId", required = false) String collegeIdStr,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        User currentUser = userService.findUserByEmail(((UserDetails)SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername());
        Event existingEvent = eventService.findEventEntityById(eventId); // Fetch existing
        if (existingEvent == null) return ResponseEntity.notFound().build();

        // Authorization
        if (!(existingEvent.getCreatedBy().getUserId().equals(currentUser.getUserId()) || "admin".equalsIgnoreCase(currentUser.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(false, "Not authorized."));
        }

        LocalDateTime eventDateTime;
        try {
            LocalDate parsedDate = LocalDate.parse(dateStr);
            LocalTime parsedTime = LocalTime.parse(timeStr);
            eventDateTime = LocalDateTime.of(parsedDate, parsedTime);
            // Future check might be optional for updates or different
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid date/time format for update."));
        }

        existingEvent.setTitle(title);
        existingEvent.setDescription(description);
        existingEvent.setEventDate(eventDateTime);
        existingEvent.setLocation(location);
        // Handle collegeId update...

        if (imageFile != null && !imageFile.isEmpty()) {
            if (existingEvent.getImageUrl() != null) { /* delete old image */
                try { fileStorageService.deleteFile(existingEvent.getImageUrl().substring(existingEvent.getImageUrl().lastIndexOf("/") + 1)); } catch (Exception e) {/* log */}
            }
            String fileName = fileStorageService.storeFile(imageFile);
            existingEvent.setImageUrl(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/events/uploads/").path(fileName).toUriString());
        }

        EventDto updatedEventDto = eventService.createAndSaveEvent(existingEvent, currentUser); // Re-use save method
        return ResponseEntity.ok(updatedEventDto);
    }

    // GET /uploads/{filename}
    @GetMapping("/uploads/{filename:.+}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Resource> serveEventFile(@PathVariable String filename, HttpServletRequest request) {
        // ... (same as before)
        Resource resource;
        try { resource = fileStorageService.loadFileAsResource(filename); }
        catch (MyFileNotFoundException ex) { return ResponseEntity.notFound().build(); }
        String contentType = null;
        try { contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath()); }
        catch (IOException ex) { logger.info("Could not determine file type for event image: {}. Error: {}", filename, ex.getMessage()); }
        if (contentType == null) { contentType = "application/octet-stream"; }
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"").body(resource);
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> deleteEvent(@PathVariable Long eventId) { eventService.deleteEvent(eventId); return ResponseEntity.ok(new ApiResponse(true, "Event deleted successfully.")); }
    @PostMapping("/{eventId}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> joinEvent(@PathVariable Long eventId) { eventService.joinEvent(eventId); return ResponseEntity.ok(new ApiResponse(true, "Successfully joined event.")); }
    @DeleteMapping("/{eventId}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> leaveEvent(@PathVariable Long eventId) { eventService.leaveEvent(eventId); return ResponseEntity.ok(new ApiResponse(true, "Successfully left event.")); }
}
