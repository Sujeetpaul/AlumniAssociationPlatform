// --- File: com/example/alumniassocaition1/service/UserService.java ---
package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.user.UserProfileDto;
import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import com.example.alumniassocaition1.dto.user.UserUpdateRequest;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.exception.ResourceNotFoundException;
import org.springframework.security.core.userdetails.UserDetailsService;
import java.util.List;

public interface UserService extends UserDetailsService { // Extends UserDetailsService for Spring Security integration
    UserProfileDto getUserProfile(Long userId) throws ResourceNotFoundException;

    UserProfileDto getCurrentUserProfile();

    UserProfileDto updateUserProfile(UserUpdateRequest updateRequest);

    List<UserSummaryDto> getFollowers(Long userId) throws ResourceNotFoundException;

    List<UserSummaryDto> getFollowing(Long userId) throws ResourceNotFoundException;

    void followUser(Long userIdToFollow) throws ResourceNotFoundException;

    void unfollowUser(Long userIdToUnfollow) throws ResourceNotFoundException;

    User findUserById(Long userId) throws ResourceNotFoundException;

    User findUserByEmail(String email) throws ResourceNotFoundException;

    // --- NEW METHOD TO BE USED BY OTHER SERVICES LIKE SearchServiceImpl ---
    /**
     * Retrieves the currently authenticated User entity.
     * Throws an exception if no user is authenticated or found.
     * @return The authenticated User entity.
     */
    User getCurrentAuthenticatedUserEntity();

}