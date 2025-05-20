package com.example.alumniassocaition1.controller;

import com.example.alumniassocaition1.dto.college.CollegeDto;
import com.example.alumniassocaition1.dto.college.CollegeRegistrationRequest;
import com.example.alumniassocaition1.service.CollegeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/colleges")
public class CollegeController {

    @Autowired
    private CollegeService collegeService;

    @PostMapping("/register")
    public ResponseEntity<?> registerCollege(@Valid @RequestBody CollegeRegistrationRequest registrationRequest) {
        CollegeDto newCollege = collegeService.registerCollege(registrationRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(newCollege);
    }
}
