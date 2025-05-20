package com.example.alumniassocaition1.repository;

import com.example.alumniassocaition1.entity.UserFollow;
import com.example.alumniassocaition1.entity.UserFollowId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, UserFollowId> {
    // Find all users that a specific user is following
    List<UserFollow> findByIdFollowerId(Long followerId);

    // Find all followers of a specific user
    List<UserFollow> findByIdFollowingId(Long followingId);

    Optional<UserFollow> findByIdFollowerIdAndIdFollowingId(Long followerId, Long followingId);

    void deleteByIdFollowerIdAndIdFollowingId(Long followerId, Long followingId);

    boolean existsByIdFollowerIdAndIdFollowingId(Long followerId, Long followingId);

    long countByIdFollowerId(Long followerId); // Count of users someone is following

    long countByIdFollowingId(Long followingId); // Count of followers

    // In UserFollowRepository.java
    void deleteByIdFollowerId(Long followerId);

    void deleteByIdFollowingId(Long followingId);
}
