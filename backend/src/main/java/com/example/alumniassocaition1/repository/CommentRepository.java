package com.example.alumniassocaition1.repository;

import com.example.alumniassocaition1.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostPostIdOrderByCreatedAtAsc(Long postId);

    List<Comment> findByAuthorUserId(Long userId);

    long countByPostPostId(Long postId);
    // Add custom query methods if needed
}
