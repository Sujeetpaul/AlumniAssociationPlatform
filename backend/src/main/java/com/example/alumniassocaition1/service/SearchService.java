// --- File: com/example/alumniassocaition1/service/SearchService.java ---
package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import java.util.List;

public interface SearchService {
    List<UserSummaryDto> searchUsersInMyCollege(String searchTerm);
}