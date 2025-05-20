package com.example.alumniassocaition1.entity;


import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "colleges")
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "college_id")
    private Long collegeId;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(name = "contact_person_name")
    private String contactPersonName;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "registration_status", nullable = false) // e.g., 'pending', 'approved', 'rejected'
    private String registrationStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "college")
    private Set<User> users;

    @OneToMany(mappedBy = "college")
    private Set<Donation> donations;

    @OneToMany(mappedBy = "college") // Assuming events are directly linked to a college
    private Set<Event> events;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

