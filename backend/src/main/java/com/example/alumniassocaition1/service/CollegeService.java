package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.college.CollegeDto;
import com.example.alumniassocaition1.dto.college.CollegeRegistrationRequest;

public interface CollegeService {
    CollegeDto registerCollege(CollegeRegistrationRequest registrationRequest);
}
