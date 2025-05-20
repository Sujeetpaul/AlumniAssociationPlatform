package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.CommentCreateRequest;
import com.example.alumniassocaition1.dto.CommentDto;
import com.example.alumniassocaition1.exception.ResourceNotFoundException; // Added for consistency if methods throw it

import java.util.List;

public interface CommentService {
    List<CommentDto> getCommentsForPost(Long postId) throws ResourceNotFoundException; // Added exception

    CommentDto addCommentToPost(Long postId, CommentCreateRequest createRequest) throws ResourceNotFoundException; // Added exception

    void deleteComment(Long commentId) throws ResourceNotFoundException; // Added exception
}
