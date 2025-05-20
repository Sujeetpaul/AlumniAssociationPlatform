package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.post.PostCreateRequest;
import com.example.alumniassocaition1.dto.post.PostDto;
import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import com.example.alumniassocaition1.entity.Post;
import com.example.alumniassocaition1.entity.PostLike;
import com.example.alumniassocaition1.entity.PostLikeId;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.entity.College;
import com.example.alumniassocaition1.exception.FileStorageException;
import com.example.alumniassocaition1.exception.ResourceNotFoundException;
import com.example.alumniassocaition1.repository.CommentRepository;
import com.example.alumniassocaition1.repository.PostLikeRepository;
import com.example.alumniassocaition1.repository.PostRepository;
import com.example.alumniassocaition1.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Collections;

@Service
public class PostServiceImpl implements PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostServiceImpl.class);

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final FileStorageService fileStorageService;
    private final UserService userService;

    @Autowired
    public PostServiceImpl(PostRepository postRepository, PostLikeRepository postLikeRepository,
                           CommentRepository commentRepository, FileStorageService fileStorageService,
                           UserService userService) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.fileStorageService = fileStorageService;
        this.userService = userService;
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        try {
            return userService.findUserByEmail(userPrincipal.getUsername());
        } catch (ResourceNotFoundException e) {
            logger.warn("Authenticated user email not found in database: {}", userPrincipal.getUsername());
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> getAllPosts(Pageable pageable) {
        User currentUser = getCurrentAuthenticatedUser();
        Page<Post> postsPage;

        if (currentUser != null && currentUser.getCollege() != null) {
            logger.info("Fetching posts for college ID: {}", currentUser.getCollege().getCollegeId());
            postsPage = postRepository.findByAuthorCollegeCollegeIdOrderByCreatedAtDesc(
                    currentUser.getCollege().getCollegeId(),
                    pageable
            );
        } else {
            logger.info("Current user or user's college is null. Fetching all posts globally (requires permitAll on endpoint).");
            postsPage = postRepository.findAll(pageable);
        }

        final User finalCurrentUser = currentUser;
        return postsPage.map(post -> mapPostToDto(post, finalCurrentUser));
    }

    @Override
    @Transactional(readOnly = true)
    public PostDto getPostById(Long postId) throws ResourceNotFoundException{
        User currentUser = getCurrentAuthenticatedUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        return mapPostToDto(post, currentUser);
    }

    @Override
    @Transactional
    public PostDto createAndSavePost(Post post, User currentUser) throws FileStorageException {
        // (Implementation from previous correct version)
        if (currentUser == null) throw new AccessDeniedException("User must be authenticated to create posts.");
        if (post.getAuthor() == null) post.setAuthor(currentUser);
        if (!("alumnus".equalsIgnoreCase(currentUser.getRole()) || "admin".equalsIgnoreCase(currentUser.getRole()))) {
            throw new AccessDeniedException("User does not have permission to create posts.");
        }
        if (currentUser.getCollege() == null) throw new IllegalStateException("User creating post is not associated with a college.");
        post.setCollege(currentUser.getCollege());
        if (!StringUtils.hasText(post.getContent()) && !StringUtils.hasText(post.getImageUrl())) {
            throw new IllegalArgumentException("Post must have content or an image.");
        }
        Post savedPost = postRepository.save(post);
        logger.info("Post saved with ID: {}, Author ID: {}, College ID: {}", savedPost.getPostId(), savedPost.getAuthor().getUserId(), savedPost.getCollege() != null ? savedPost.getCollege().getCollegeId() : "N/A");
        return mapPostToDto(savedPost, currentUser);
    }

    @Override
    @Transactional
    public PostDto createPostFromDto(PostCreateRequest createRequestDto, User currentUser) {
        // (Implementation from previous correct version)
        if (currentUser == null) throw new AccessDeniedException("User must be authenticated to create posts.");
        if (!("alumnus".equalsIgnoreCase(currentUser.getRole()) || "admin".equalsIgnoreCase(currentUser.getRole()))) {
            throw new AccessDeniedException("User does not have permission to create posts.");
        }
        if (currentUser.getCollege() == null) throw new IllegalStateException("User creating post is not associated with a college.");
        Post post = new Post();
        post.setContent(createRequestDto.getContent());
        post.setAuthor(currentUser);
        post.setCollege(currentUser.getCollege());
        Post savedPost = postRepository.save(post);
        return mapPostToDto(savedPost, currentUser);
    }

    @Override
    @Transactional
    public PostDto updateFullPost(Long postId, String content, MultipartFile imageFile, User currentUser) throws FileStorageException, ResourceNotFoundException {
        // (Implementation from previous correct version)
        if (currentUser == null) throw new AccessDeniedException("User must be authenticated to update posts.");
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        boolean isAdminOfSameCollege = "admin".equalsIgnoreCase(currentUser.getRole()) && currentUser.getCollege() != null && post.getCollege() != null && currentUser.getCollege().getCollegeId().equals(post.getCollege().getCollegeId());
        if (!post.getAuthor().getUserId().equals(currentUser.getUserId()) && !isAdminOfSameCollege) {
            throw new AccessDeniedException("User does not have permission to update this post.");
        }
        if (content != null) post.setContent(content);
        if (imageFile != null && !imageFile.isEmpty()) {
            if (StringUtils.hasText(post.getImageUrl())) {
                try { String oldFileName = post.getImageUrl().substring(post.getImageUrl().lastIndexOf("/") + 1); if (!oldFileName.isEmpty()) fileStorageService.deleteFile(oldFileName); }
                catch (Exception e) { logger.error("Could not delete old post image: {}. Error: {}", post.getImageUrl(), e.getMessage()); }
            }
            String newFileName = fileStorageService.storeFile(imageFile);
            post.setImageUrl(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/posts/uploads/").path(newFileName).toUriString());
        }
        if (!StringUtils.hasText(post.getContent()) && !StringUtils.hasText(post.getImageUrl())) {
            throw new IllegalArgumentException("Post update would result in no content and no image.");
        }
        Post updatedPost = postRepository.save(post);
        return mapPostToDto(updatedPost, currentUser);
    }

    @Override
    @Transactional
    public PostDto updatePostFromDto(Long postId, PostCreateRequest updateRequestDto, User currentUser) throws ResourceNotFoundException {
        // (Implementation from previous correct version)
        if (currentUser == null) throw new AccessDeniedException("User must be authenticated to update posts.");
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        boolean isAdminOfSameCollege = "admin".equalsIgnoreCase(currentUser.getRole()) && currentUser.getCollege() != null && post.getCollege() != null && currentUser.getCollege().getCollegeId().equals(post.getCollege().getCollegeId());
        if (!post.getAuthor().getUserId().equals(currentUser.getUserId()) && !isAdminOfSameCollege) {
            throw new AccessDeniedException("User does not have permission to update this post.");
        }
        post.setContent(updateRequestDto.getContent());
        Post updatedPost = postRepository.save(post);
        return mapPostToDto(updatedPost, currentUser);
    }

    @Override
    @Transactional
    public void deletePost(Long postId) throws ResourceNotFoundException{
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) throw new AccessDeniedException("Authentication required to delete posts.");
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        boolean isAdminOfSameCollege = "admin".equalsIgnoreCase(currentUser.getRole()) && currentUser.getCollege() != null && post.getCollege() != null && currentUser.getCollege().getCollegeId().equals(post.getCollege().getCollegeId());
        if (!(post.getAuthor().getUserId().equals(currentUser.getUserId()) || isAdminOfSameCollege)) {
            throw new AccessDeniedException("User does not have permission to delete this post.");
        }
        String imageUrl = post.getImageUrl();
        postRepository.delete(post);
        logger.info("Deleted post with ID: {}", postId);
        if (StringUtils.hasText(imageUrl)) {
            try { String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1); if(!fileName.isEmpty()) fileStorageService.deleteFile(fileName); }
            catch (Exception e) { logger.error("Could not delete post image file: {}. Error: {}", imageUrl, e.getMessage());}
        }
    }

    @Override
    @Transactional
    public void likePost(Long postId) throws ResourceNotFoundException{
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) throw new AccessDeniedException("Authentication required to like posts.");
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        PostLikeId likeId = new PostLikeId(post.getPostId(), currentUser.getUserId());
        if (postLikeRepository.existsById(likeId)) { return; }
        PostLike postLike = new PostLike();
        postLike.setId(likeId);
        postLike.setPost(post);
        postLike.setUser(currentUser);
        postLikeRepository.save(postLike);
    }

    @Override
    @Transactional
    public void unlikePost(Long postId) throws ResourceNotFoundException {
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) throw new AccessDeniedException("Authentication required to unlike posts.");
        if (!postRepository.existsById(postId)) throw new ResourceNotFoundException("Post", "id", postId);
        PostLikeId likeId = new PostLikeId(postId, currentUser.getUserId());
        if (!postLikeRepository.existsById(likeId)) { return; }
        postLikeRepository.deleteById(likeId);
    }

    private PostDto mapPostToDto(Post post, User currentUser) {
        PostDto dto = new PostDto();
        dto.setId(post.getPostId());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setCreatedAt(post.getCreatedAt());

        if (post.getAuthor() != null) {
            UserSummaryDto authorDto = new UserSummaryDto();
            authorDto.setId(post.getAuthor().getUserId());
            // Ensure name is being set, and that post.getAuthor().getName() is not null
            authorDto.setName(post.getAuthor().getName() != null ? post.getAuthor().getName() : "Unknown Author");
            authorDto.setEmail(post.getAuthor().getEmail());
            authorDto.setRole(post.getAuthor().getRole());
            dto.setAuthor(authorDto);
            logger.debug("Mapping post {}: Author ID {}, Name '{}'", post.getPostId(), authorDto.getId(), authorDto.getName());
        } else {
            UserSummaryDto unknownAuthorDto = new UserSummaryDto();
            unknownAuthorDto.setName("Unknown User"); // Default if author is somehow null
            dto.setAuthor(unknownAuthorDto);
            logger.warn("Post with ID {} has a NULL author relationship in mapPostToDto.", post.getPostId());
        }

        dto.setLikesCount(postLikeRepository.countByIdPostId(post.getPostId()));
        dto.setCommentsCount(commentRepository.countByPostPostId(post.getPostId()));

        if (currentUser != null && post.getPostId() != null && currentUser.getUserId() != null) {
            dto.setLikedByCurrentUser(postLikeRepository.existsByIdPostIdAndIdUserId(post.getPostId(), currentUser.getUserId()));
        } else {
            dto.setLikedByCurrentUser(false);
        }
        return dto;
    }
}
