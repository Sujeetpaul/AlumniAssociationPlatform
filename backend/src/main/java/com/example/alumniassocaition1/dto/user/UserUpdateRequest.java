package com.example.alumniassocaition1.dto.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String headline;
    private String location;
    private String about;
    // profilePictureUrl might be handled by a separate endpoint if using local storage for profile pics
    // Or, if updating via this DTO, the backend would handle saving the new file and updating the URL.
    // For simplicity, we'll assume profile picture updates might need a dedicated endpoint or
    // the URL is manually set if not uploading a new file.
}
