package com.example.alumniassocaition1.dto;

import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDto {
    private Long id;
    private Long postId;
    private UserSummaryDto author;
    private String text;
    private LocalDateTime createdAt;
}
