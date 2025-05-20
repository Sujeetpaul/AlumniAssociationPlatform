package com.example.alumniassocaition1.dto;

import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtAuthenticationResponse {
    private String token;
    private UserSummaryDto user;
}
