package com.example.alumniassocaition1.repository;

import com.example.alumniassocaition1.entity.Event;
import org.springframework.data.domain.Page; // If using Pageable
import org.springframework.data.domain.Pageable; // If using Pageable
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // Find events by a specific college, ordered by event date descending
    List<Event> findByCollegeCollegeIdOrderByEventDateDesc(Long collegeId);

    // Find all events, ordered by event date descending (for global views or super admins)
    List<Event> findAllByOrderByEventDateDesc();

    // If you want pagination for these:
    // Page<Event> findByCollegeCollegeIdOrderByEventDateDesc(Long collegeId, Pageable pageable);
    // Page<Event> findAllByOrderByEventDateDesc(Pageable pageable);


    // Existing methods
    List<Event> findByCreatedByUserId(Long userId); // Used in AdminServiceImpl for deleting user's events
    List<Event> findByEventDateAfter(LocalDateTime date); // Used on HomePage
}
