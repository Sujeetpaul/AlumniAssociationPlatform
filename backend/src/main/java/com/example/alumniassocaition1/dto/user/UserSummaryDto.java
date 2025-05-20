package com.example.alumniassocaition1.dto.user;

import lombok.Data;

@Data
public class UserSummaryDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    public String Status;
    // Add other fields as needed for summary
}
