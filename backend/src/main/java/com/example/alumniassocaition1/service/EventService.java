package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.EventDto;
import com.example.alumniassocaition1.dto.EventCreateRequest; // For JSON endpoint
import com.example.alumniassocaition1.entity.Event;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.exception.ResourceNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EventService {
    List<EventDto> getAllEvents();
    EventDto getEventById(Long eventId) throws ResourceNotFoundException;

    // This method is called by the controller when it has already constructed the Event entity
    // from individual multipart parts.
    EventDto createAndSaveEvent(Event event, User currentUser);

    // This method is for the JSON-only controller endpoint that uses the DTO directly.
    EventDto createEventFromDto(EventCreateRequest createRequestDto, User currentUser);

    // Update method for JSON-only DTO-based updates
    EventDto updateEventFromDto(Long eventId, EventCreateRequest updateRequestDto, User currentUser) throws ResourceNotFoundException;

    // Helper to fetch entity, useful for updates in controller before calling save/update service method
    Event findEventEntityById(Long eventId) throws ResourceNotFoundException;

    void deleteEvent(Long eventId) throws ResourceNotFoundException;
    void joinEvent(Long eventId) throws ResourceNotFoundException;
    void leaveEvent(Long eventId) throws ResourceNotFoundException;
}