package com.example.alumniassocaition1.dto.user;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;


@Data
public class AdminUserCreateRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String role;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String status;

    private Long collegeId;
}
