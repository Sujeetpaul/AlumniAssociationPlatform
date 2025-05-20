package com.example.alumniassocaition1.controller;

import com.example.alumniassocaition1.dto.ApiResponse;
// PostCreateRequest is now only for the JSON endpoint
import com.example.alumniassocaition1.dto.post.PostCreateRequest;
import com.example.alumniassocaition1.dto.post.PostDto;
import com.example.alumniassocaition1.entity.Post;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.exception.MyFileNotFoundException;
import com.example.alumniassocaition1.service.FileStorageService;
import com.example.alumniassocaition1.service.PostService;
import com.example.alumniassocaition1.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid; // For the JSON endpoint
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostService postService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserService userService;

    // --- GET, LIKE/UNLIKE, DELETE Endpoints (can remain largely the same) ---
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<PostDto>> getAllPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<PostDto> posts = postService.getAllPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> getPostById(@PathVariable Long postId) {
        PostDto post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    // --- Multipart POST Endpoint for Post Creation (Individual Parts) ---
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAnyRole('ALUMNUS', 'ADMIN')")
    public ResponseEntity<?> createPostWithIndividualParts(
            @RequestPart("content") String content,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        logger.info("MULTIPART POST /api/posts hit. Content: [{}]", content);
        if (imageFile != null && !imageFile.isEmpty()) {
            logger.info("ImageFile received: {}", imageFile.getOriginalFilename());
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        User currentUser = userService.findUserByEmail(userPrincipal.getUsername());

        // Basic Validation for content
        if (!StringUtils.hasText(content) && (imageFile == null || imageFile.isEmpty())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Post content cannot be blank if no image is provided."));
        }
        if (content != null && content.isBlank() && (imageFile == null || imageFile.isEmpty())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Post content cannot be blank if no image is provided."));
        }


        Post post = new Post();
        post.setContent(content != null ? content : ""); // Ensure content is not null for entity
        post.setAuthor(currentUser);
        // College is implicitly set via User's college in the service or by Post entity relationship

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String fileName = fileStorageService.storeFile(imageFile);
                String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/posts/uploads/") // Ensure this matches SecurityConfig
                        .path(fileName)
                        .toUriString();
                post.setImageUrl(fileDownloadUri);
            } catch (Exception e) {
                logger.error("Failed to upload image for post: {}", content, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse(false, "Failed to upload image: " + e.getMessage()));
            }
        }

        // Call a service method that accepts the constructed Post entity
        PostDto newPostDto = postService.createAndSavePost(post, currentUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(newPostDto);
    }

    // Optional: JSON-only POST endpoint (if you still want to support it without images)
    // This would use the PostCreateRequest DTO.
    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ALUMNUS', 'ADMIN')")
    public ResponseEntity<PostDto> createPostWithJson(@Valid @RequestBody PostCreateRequest createRequestDto) {
        logger.info("JSON POST /api/posts hit with DTO: {}", createRequestDto);
        // This service method would need to exist or be adapted
        PostDto newPost = postService.createPostFromDto(createRequestDto, userService.findUserByEmail(((UserDetails)SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername()));
        return ResponseEntity.status(HttpStatus.CREATED).body(newPost);
    }

    // --- Multipart PUT Endpoint for Post Update (Individual Parts) ---
    @PutMapping(value = "/{postId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updatePostWithIndividualParts(
            @PathVariable Long postId,
            @RequestPart("content") String content,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        logger.info("MULTIPART PUT /api/posts/{} hit. Content: [{}]", postId, content);
        if (imageFile != null && !imageFile.isEmpty()) {
            logger.info("ImageFile received for update: {}", imageFile.getOriginalFilename());
        }

        // Basic Validation for content
        if (!StringUtils.hasText(content) && (imageFile == null || imageFile.isEmpty())) {
            // If allowing image-only posts, this validation might change for updates
            // (e.g., allowing content to be blank if an image is being kept or added)
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Post content cannot be blank if no image is being provided/kept."));
        }

        User currentUser = userService.findUserByEmail(((UserDetails)SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername());

        // The service will handle fetching the existing post, authorization, updating, and image logic
        PostDto updatedPostDto = postService.updateFullPost(postId, content, imageFile, currentUser);

        return ResponseEntity.ok(updatedPostDto);
    }

    // Optional: JSON-only PUT endpoint
    @PutMapping(value = "/{postId}", consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> updatePostWithJson(
            @PathVariable Long postId,
            @Valid @RequestBody PostCreateRequest updateRequestDto) {
        User currentUser = userService.findUserByEmail(((UserDetails)SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername());
        PostDto updatedPost = postService.updatePostFromDto(postId, updateRequestDto, currentUser);
        return ResponseEntity.ok(updatedPost);
    }

    // PATCH would follow a similar pattern if it needs to handle multipart.

    @DeleteMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok(new ApiResponse(true, "Post deleted successfully."));
    }

    @PostMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> likePost(@PathVariable Long postId) {
        postService.likePost(postId);
        return ResponseEntity.ok(new ApiResponse(true, "Post liked."));
    }

    @DeleteMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> unlikePost(@PathVariable Long postId) {
        postService.unlikePost(postId);
        return ResponseEntity.ok(new ApiResponse(true, "Post unliked."));
    }

    @GetMapping("/uploads/{filename:.+}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename, HttpServletRequest request) {
        Resource resource;
        try {
            resource = fileStorageService.loadFileAsResource(filename);
        } catch (MyFileNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            logger.info("Could not determine file type for: {}. Error: {}", filename, ex.getMessage());
        }
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
