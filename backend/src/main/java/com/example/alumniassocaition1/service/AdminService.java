package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.dto.user.AdminUserCreateRequest;
import com.example.alumniassocaition1.dto.user.UserStatusUpdateRequest;
import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import com.example.alumniassocaition1.exception.ResourceNotFoundException; // Import custom exceptions
import java.util.List;

public interface AdminService {
    List<UserSummaryDto> getAllUsersForAdminCollege();
    UserSummaryDto adminAddUser(AdminUserCreateRequest createRequest);
    void adminRemoveUser(Long userId) throws ResourceNotFoundException; // Added exception
    UserSummaryDto adminUpdateUserStatus(Long userId, UserStatusUpdateRequest statusUpdateRequest) throws ResourceNotFoundException; // Added exception
    void adminRemoveEvent(Long eventId) throws ResourceNotFoundException; // Added exception
}

