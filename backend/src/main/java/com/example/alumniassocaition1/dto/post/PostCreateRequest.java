package com.example.alumniassocaition1.dto.post; // Your package

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostCreateRequest {
    @JsonProperty("content") // Explicitly map the JSON key
    @NotBlank(message = "must not be blank")
    private String content;
}