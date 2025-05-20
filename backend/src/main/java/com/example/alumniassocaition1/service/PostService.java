package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.post.PostCreateRequest; // For JSON endpoint
import com.example.alumniassocaition1.dto.post.PostDto;
import com.example.alumniassocaition1.entity.Post; // If service methods take entity
import com.example.alumniassocaition1.entity.User; // For current user context
import com.example.alumniassocaition1.exception.FileStorageException;
import com.example.alumniassocaition1.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface PostService {
    Page<PostDto> getAllPosts(Pageable pageable);
    PostDto getPostById(Long postId) throws ResourceNotFoundException;

    // Method for when controller constructs the Post entity from individual parts
    PostDto createAndSavePost(Post post, User currentUser) throws FileStorageException;

    // Method for JSON-only DTO-based creation (if keeping that controller endpoint)
    PostDto createPostFromDto(PostCreateRequest createRequestDto, User currentUser);

    // Method for multipart update where controller passes individual parts
    PostDto updateFullPost(Long postId, String content, MultipartFile imageFile, User currentUser) throws FileStorageException, ResourceNotFoundException;

    // Method for JSON-only DTO-based update
    PostDto updatePostFromDto(Long postId, PostCreateRequest updateRequestDto, User currentUser) throws ResourceNotFoundException;

    void deletePost(Long postId) throws ResourceNotFoundException;
    void likePost(Long postId) throws ResourceNotFoundException;
    void unlikePost(Long postId) throws ResourceNotFoundException;
}
