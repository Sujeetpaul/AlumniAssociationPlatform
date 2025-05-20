// src/services/events.js
import apiClient from './apiClient';

export const fetchEvents = async () => {
  try {
    const response = await apiClient.get('/events');
    return response.data;
  } catch (error) {
    console.error("Fetch events service error:", error.response?.data || error.message || error, error.isAxiosError ? error : '');
    if (error.isAxiosError && error.response) { throw error.response.data || error; }
    throw new Error("Failed to fetch events");
  }
};

export const fetchEventById = async (eventId) => {
    try {
        const response = await apiClient.get(`/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error(`Fetch event by ID (${eventId}) service error:`, error.response?.data || error.message || error, error.isAxiosError ? error : '');
        if (error.isAxiosError && error.response) { throw error.response.data || error; }
        throw new Error(`Failed to fetch event ${eventId}`);
    }
};

/**
 * Creates a new event by sending individual form parts.
 * @param {object} eventData - Object from EventForm, where eventData.date is the direct value from datetime-local input (e.g., "2025-05-22T19:42").
 * @param {File} [imageFile] - Optional image file.
 */
export const createEvent = async (eventData, imageFile) => {
  try {
    const formData = new FormData();
    
    formData.append('title', eventData.title || '');
    formData.append('description', eventData.description || '');
    
    let datePart = '';
    let timePart = '';

    // eventData.date is expected to be from <input type="datetime-local">
    // which has the format "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
    if (eventData.date) { 
        const dateTimeParts = eventData.date.split('T');
        if (dateTimeParts.length === 2) {
            datePart = dateTimeParts[0]; // "YYYY-MM-DD"
            timePart = dateTimeParts[1];   // "HH:MM" or "HH:MM:SS"
            // If timePart includes seconds and you only want HH:MM, you can truncate:
            // if (timePart.length > 5) timePart = timePart.substring(0, 5);
        } else {
            console.warn("[events.js] eventData.date is not in expected YYYY-MM-DDTHH:MM format:", eventData.date);
        }
    }

    formData.append('date', datePart); 
    formData.append('time', timePart);   
    formData.append('location', eventData.location || '');

    if (eventData.collegeId) {
        formData.append('collegeId', eventData.collegeId.toString());
    }

    if (imageFile instanceof File) {
      formData.append('imageFile', imageFile);
    }
    
    console.log("[events.js] FormData for createEvent (parts):", Array.from(formData.entries()));

    const response = await apiClient.post('/events', formData); 
    return response.data;
  } catch (error) {
    console.error("Create event service error:", 
        error.response?.data || error.message || error,
        error.isAxiosError ? error : ''
    ); 
    if (error.isAxiosError && error.response) {
        throw error.response.data || error;
    }
    throw error;
  }
};

export const updateEvent = async (eventId, eventData, imageFile) => {
    try {
        const formData = new FormData();
        formData.append('title', eventData.title || '');
        formData.append('description', eventData.description || '');
        
        let datePart = '';
        let timePart = '';
        if (eventData.date) {
            const dateTimeParts = eventData.date.split('T');
            if (dateTimeParts.length === 2) {
                datePart = dateTimeParts[0];
                timePart = dateTimeParts[1];
            }
        }
        formData.append('date', datePart);
        formData.append('time', timePart);
        formData.append('location', eventData.location || '');
        if (eventData.collegeId) {
            formData.append('collegeId', eventData.collegeId.toString());
        }

        if (imageFile instanceof File) {
            formData.append('imageFile', imageFile);
        }
        
        console.log(`[events.js] FormData for updateEvent ${eventId} (parts):`, Array.from(formData.entries()));
        const response = await apiClient.put(`/events/${eventId}`, formData);
        return response.data;
    } catch (error) {
        console.error(`Update event (${eventId}) service error:`, 
            error.response?.data || error.message || error,
            error.isAxiosError ? error : ''
        );
        if (error.isAxiosError && error.response) {
            throw error.response.data || error;
        }
        throw error;
    }
};

export const deleteEvent = async (eventId) => {
    try {
        await apiClient.delete(`/events/${eventId}`);
    } catch (error) {
        console.error(`Delete event (${eventId}) service error:`, error.response?.data || error.message || error, error.isAxiosError ? error : '');
        if (error.isAxiosError && error.response) { throw error.response.data || error; }
        throw new Error(`Failed to delete event ${eventId}`);
    }
};

export const joinEvent = async (eventId) => {
    if (!eventId) {
        const errorMsg = "joinEvent: eventId is required.";
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    try {
        // Backend endpoint: POST /api/events/{eventId}/join
        const response = await apiClient.post(`/events/${eventId}/join`);
        return response.data; // Assuming backend returns { success: true, message: "..." } or similar
    } catch (error) {
        console.error(`Join event (${eventId}) service error:`, 
            error.response?.data || error.message || error,
            error.isAxiosError ? error : ''
        );
        if (error.isAxiosError && error.response) {
            throw error.response.data || error; // Prefer backend's structured error
        }
        throw error; // Fallback
    }
};
export const leaveEvent = async (eventId) => {
    try {
        await apiClient.delete(`/events/${eventId}/join`);
    } catch (error) {
        console.error(`Leave event (${eventId}) service error:`, error.response?.data || error.message || error, error.isAxiosError ? error : '');
        if (error.isAxiosError && error.response) { throw error.response.data || error; }
        throw new Error(`Failed to leave event ${eventId}`);
    }
};
