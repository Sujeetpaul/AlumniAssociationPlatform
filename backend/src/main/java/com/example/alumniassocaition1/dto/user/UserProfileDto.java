package com.example.alumniassocaition1.dto.user;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String headline;
    private String location;
    private String about;
    private String profilePictureUrl; // This will be a URL to a locally served file
    private Long followersCount;
    private Long followingCount;
    private LocalDateTime createdAt;
}
