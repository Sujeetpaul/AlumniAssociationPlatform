package com.example.alumniassocaition1.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserStatusUpdateRequest {
    @NotBlank
    private String status;
}
