package com.example.alumniassocaition1.controller;

import com.example.alumniassocaition1.dto.ApiResponse;
import com.example.alumniassocaition1.dto.JwtAuthenticationResponse;
import com.example.alumniassocaition1.dto.LoginRequest;
import com.example.alumniassocaition1.dto.user.UserSummaryDto;
import com.example.alumniassocaition1.entity.User;
import com.example.alumniassocaition1.security.JwtTokenProvider;
import com.example.alumniassocaition1.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtTokenProvider tokenProvider;

    @Autowired
    UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            User user = userService.findUserByEmail(loginRequest.getEmail());
            UserSummaryDto userSummary = new UserSummaryDto();
            BeanUtils.copyProperties(user, userSummary);
            userSummary.setId(user.getUserId());

            return ResponseEntity.ok(new JwtAuthenticationResponse(jwt, userSummary));

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "An error occurred during authentication"));
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new ApiResponse(true, "Logout successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userService.findUserByEmail(email);
        UserSummaryDto userSummary = new UserSummaryDto();
        BeanUtils.copyProperties(user, userSummary);
        userSummary.setId(user.getUserId());
        userSummary.setRole(user.getRole());

        return ResponseEntity.ok(userSummary);
    }
}
