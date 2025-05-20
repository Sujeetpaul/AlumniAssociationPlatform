package com.example.alumniassocaition1.repository;

import com.example.alumniassocaition1.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByUserUserId(Long userId);

    List<Donation> findByCollegeCollegeId(Long collegeId);
    // Add custom query methods if needed
}
