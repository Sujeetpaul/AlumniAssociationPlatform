package com.example.alumniassocaition1.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false) // e.g., 'student', 'alumnus', 'admin'
    private String role;

    @Column(nullable = false) // e.g., 'active', 'inactive', 'pending_verification'
    private String status;

    @Column(name = "profile_headline")
    private String profileHeadline;

    @Column(name = "profile_location")
    private String profileLocation;

    @Lob // For longer text
    @Column(name = "profile_about")
    private String profileAbout;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "createdBy")
    private Set<Event> createdEvents;

    @OneToMany(mappedBy = "author")
    private Set<Post> posts;

    @OneToMany(mappedBy = "author")
    private Set<Comment> comments;

    @OneToMany(mappedBy = "user")
    private Set<Donation> donations;

    @OneToMany(mappedBy = "user")
    private Set<EventAttendee> eventAttendances;

    @OneToMany(mappedBy = "user")
    private Set<PostLike> postLikes;

    @OneToMany(mappedBy = "follower")
    private Set<UserFollow> following; // Users this user is following

    @OneToMany(mappedBy = "following")
    private Set<UserFollow> followers; // Users following this user


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
