package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.college.CollegeDto; // Corrected DTO path
import com.example.alumniassocaition1.dto.college.CollegeRegistrationRequest; // Corrected DTO path
import com.example.alumniassocaition1.entity.College;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.repository.CollegeRepository;
import com.example.alumniassocaition1.repository.UserRepository;
// Corrected: Use Spring's Transactional annotation
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CollegeServiceImpl implements CollegeService {

    private final CollegeRepository collegeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public CollegeServiceImpl(CollegeRepository collegeRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.collegeRepository = collegeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional // Uses org.springframework.transaction.annotation.Transactional
    public CollegeDto registerCollege(CollegeRegistrationRequest request) {
        if (collegeRepository.findByName(request.getCollegeName()).isPresent()) {
            throw new IllegalArgumentException("College with name '" + request.getCollegeName() + "' already exists.");
        }
        if (userRepository.existsByEmail(request.getAdminUser().getEmail())) { // More efficient check
            throw new IllegalArgumentException("User with email '" + request.getAdminUser().getEmail() + "' already exists.");
        }

        College college = new College();


        college.setName(request.getCollegeName());
        college.setAddress(request.getAddress());
        college.setContactPersonName(request.getContactPerson());
        college.setContactEmail(request.getContactEmail());
        college.setContactPhone(request.getContactPhone());
        college.setRegistrationStatus("approved");

        College savedCollege = collegeRepository.save(college);

        User adminUser = new User();
        adminUser.setName(request.getAdminUser().getName());
        adminUser.setEmail(request.getAdminUser().getEmail());
        adminUser.setPasswordHash(passwordEncoder.encode(request.getAdminUser().getPassword()));
        adminUser.setRole("admin");
        adminUser.setStatus("active"); // Or "pending_verification" based on your flow
        adminUser.setCollege(savedCollege);
        userRepository.save(adminUser);

        CollegeDto collegeDto = new CollegeDto();
        BeanUtils.copyProperties(savedCollege, collegeDto);
        collegeDto.setCollegeId(savedCollege.getCollegeId()); // Ensure ID is mapped
        return collegeDto;
    }
}
