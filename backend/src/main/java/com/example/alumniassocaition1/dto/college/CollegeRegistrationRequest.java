package com.example.alumniassocaition1.dto.college;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CollegeRegistrationRequest {
    @NotBlank
    private String collegeName;
    @NotBlank
    private String address;
    @NotBlank
    private String contactPerson;
    @NotBlank
    @Email
    private String contactEmail;
    @NotBlank
    private String contactPhone;

    @NotNull
    @Valid
    private AdminUserDetails adminUser;



    @Data
    public static class AdminUserDetails {
        @NotBlank
        private String name;
        @NotBlank
        @Email
        private String email;
        @NotBlank
        private String password;
    }
}
