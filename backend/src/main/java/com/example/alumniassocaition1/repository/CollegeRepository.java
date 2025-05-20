package com.example.alumniassocaition1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
// In CollegeRepository.java, add:
import com.example.alumniassocaition1.entity.College;

import java.util.Optional;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByName(String name);
    // Add custom query methods if needed
}
