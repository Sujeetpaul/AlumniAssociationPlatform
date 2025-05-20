package com.example.alumniassocaition1.repository;

import com.example.alumniassocaition1.entity.PostLike;
import com.example.alumniassocaition1.entity.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {
    List<PostLike> findByIdPostId(Long postId);

    List<PostLike> findByIdUserId(Long userId);

    Optional<PostLike> findByIdPostIdAndIdUserId(Long postId, Long userId);

    void deleteByIdPostIdAndIdUserId(Long postId, Long userId);

    long countByIdPostId(Long postId);

    boolean existsByIdPostIdAndIdUserId(Long postId, Long userId);
    // In PostLikeRepository.java
    void deleteByIdUserId(Long userId); // New method needed

}
