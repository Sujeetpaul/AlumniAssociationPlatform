package com.example.alumniassocaition1.controller;

import com.example.alumniassocaition1.dto.ApiResponse;
import com.example.alumniassocaition1.dto.CommentCreateRequest; // Assuming DTO path
import com.example.alumniassocaition1.dto.CommentDto; // Assuming DTO path
import com.example.alumniassocaition1.service.CommentService;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") // Using a base /api, specific paths in methods
public class CommentController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);
    @Autowired
    private CommentService commentService;

    // Get comments for a specific post
    @GetMapping("/posts/{postId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommentDto>> getCommentsForPost(@PathVariable Long postId) {
        List<CommentDto> comments = commentService.getCommentsForPost(postId);
        return ResponseEntity.ok(comments);
    }

    // Add a comment to a post
    @PostMapping("/posts/{postId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto> addCommentToPost(@PathVariable Long postId,
                                                       @Valid @RequestBody CommentCreateRequest createRequest) {
        logger.info("CommentController: addCommentToPost called for postId: {}. Received text: '{}'", postId, createRequest.getText());
        CommentDto newComment = commentService.addCommentToPost(postId, createRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(newComment);
    }

    // Delete a comment
    // The API doc suggested /comments/:commentId or /posts/:postId/comments/:commentId
    // Using /comments/:commentId for simplicity here.
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()") // Authorization (comment author, post author, or admin) is handled in CommentService
    public ResponseEntity<ApiResponse> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok(new ApiResponse(true, "Comment deleted successfully."));
    }
}
