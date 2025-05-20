package com.example.alumniassocaition1.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "event_attendees")
public class EventAttendee {

    @EmbeddedId
    private EventAttendeeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventId") // Maps eventId attribute of embedded id
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId") // Maps userId attribute of embedded id
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
