package com.example.alumniassocaition1.dto.post;

import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostDto {
    private Long id;
    private String content;
    private String imageUrl; // This URL will point to the locally served file
    private UserSummaryDto author;
    private LocalDateTime createdAt;
    private long likesCount;
    private long commentsCount;
    private boolean likedByCurrentUser;
}
