package com.example.alumniassocaition1.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for unauthorized access attempts.
 * Results in an HTTP 401 Unauthorized status.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED) // This annotation ensures Spring MVC returns 401
public class UnauthorizedException extends RuntimeException { // Changed from Throwable

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}

// --- File: com/example/alumniassocaition1/exception/FileStorageException.java ---
// (This file was correct in your upload, shown for completeness)

