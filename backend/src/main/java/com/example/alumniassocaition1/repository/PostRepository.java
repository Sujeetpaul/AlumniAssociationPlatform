package com.example.alumniassocaition1.repository;

import com.example.alumniassocaition1.entity.Post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByAuthorCollegeCollegeIdOrderByCreatedAtDesc(Long collegeId, Pageable pageable);

    List<Post> findByAuthorUserIdOrderByCreatedAtDesc(Long userId);
    // Add custom query methods if needed
}
