package com.example.alumniassocaition1.controller; // Or your actual package

import com.example.alumniassocaition1.dto.ApiResponse;
import com.example.alumniassocaition1.dto.user.AdminUserCreateRequest; // Ensure this DTO path is correct
import com.example.alumniassocaition1.dto.user.UserStatusUpdateRequest;  // Ensure this DTO path is correct
import com.example.alumniassocaition1.dto.user.UserSummaryDto;       // Ensure this DTO path is correct
import com.example.alumniassocaition1.service.AdminService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // All endpoints in this controller require ADMIN role
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDto>> getUsersForAdminCollege() {
        List<UserSummaryDto> users = adminService.getAllUsersForAdminCollege();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<UserSummaryDto> addUserByAdmin(@Valid @RequestBody AdminUserCreateRequest createRequest) {
        UserSummaryDto newUser = adminService.adminAddUser(createRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> removeUserByAdmin(@PathVariable Long userId) {
        adminService.adminRemoveUser(userId);
        return ResponseEntity.ok(new ApiResponse(true, "User removed successfully."));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<UserSummaryDto> updateUserStatusByAdmin(@PathVariable Long userId,
                                                                  @Valid @RequestBody UserStatusUpdateRequest statusRequest) {
        UserSummaryDto updatedUser = adminService.adminUpdateUserStatus(userId, statusRequest);
        return ResponseEntity.ok(updatedUser);
    }

    // PUT can also be used for status update if preferred, mapping to the same service method
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserSummaryDto> putUserStatusByAdmin(@PathVariable Long userId,
                                                               @Valid @RequestBody UserStatusUpdateRequest statusRequest) {
        UserSummaryDto updatedUser = adminService.adminUpdateUserStatus(userId, statusRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<?> removeEventByAdmin(@PathVariable Long eventId) {
        adminService.adminRemoveEvent(eventId);
        return ResponseEntity.ok(new ApiResponse(true, "Event removed by admin successfully."));
    }
}
