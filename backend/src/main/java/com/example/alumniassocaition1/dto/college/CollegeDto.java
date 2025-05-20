package com.example.alumniassocaition1.dto.college;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CollegeDto {
    private Long collegeId;
    private String name;
    private String address;
    private String contactPersonName;
    private String contactEmail;
    private String contactPhone;
    private String registrationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
