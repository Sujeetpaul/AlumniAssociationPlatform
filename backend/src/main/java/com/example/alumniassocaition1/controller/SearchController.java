// --- File: com/example/alumniassocaition1/controller/SearchController.java ---
package com.example.alumniassocaition1.controller;

import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import com.example.alumniassocaition1.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/users")
    @PreAuthorize("isAuthenticated()") // User must be logged in to search
    public ResponseEntity<List<UserSummaryDto>> searchUsersInCollege(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(List.of()); // Or an ApiResponse
        }
        List<UserSummaryDto> results = searchService.searchUsersInMyCollege(query);
        return ResponseEntity.ok(results);
    }
}