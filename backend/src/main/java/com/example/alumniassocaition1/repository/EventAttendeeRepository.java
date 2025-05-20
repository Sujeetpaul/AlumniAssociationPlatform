package com.example.alumniassocaition1.repository;

import com.example.alumniassocaition1.entity.EventAttendee;
import com.example.alumniassocaition1.entity.EventAttendeeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventAttendeeRepository extends JpaRepository<EventAttendee, EventAttendeeId> {
    List<EventAttendee> findByIdEventId(Long eventId);

    List<EventAttendee> findByIdUserId(Long userId);

    Optional<EventAttendee> findByIdEventIdAndIdUserId(Long eventId, Long userId);

    void deleteByIdEventIdAndIdUserId(Long eventId, Long userId);

    boolean existsByIdEventIdAndIdUserId(Long eventId, Long userId);

    void deleteByIdUserId(Long userId);
}
