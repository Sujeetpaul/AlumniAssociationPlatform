package com.example.alumniassocaition1.dto; // Ensure this is your correct package

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // Good to have for flexibility
@AllArgsConstructor // This will generate the constructor (boolean success, String message)
public class ApiResponse {
    private boolean success;
    private String message;
    // If you have other fields, @AllArgsConstructor will include them.
    // If you only want a specific constructor, you can define it manually:
    // public ApiResponse(boolean success, String message) {
    //     this.success = success;
    //     this.message = message;
    // }
}
