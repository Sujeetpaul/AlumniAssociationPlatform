package com.example.alumniassocaition1.exception;

import com.example.alumniassocaition1.dto.ApiResponse; // Ensure this path is correct

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException; // For general multipart issues

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        logger.warn("Resource not found: {} for request {}", ex.getMessage(), request.getDescription(false));
        ApiResponse apiResponse = new ApiResponse(false, ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MyFileNotFoundException.class)
    public ResponseEntity<ApiResponse> handleMyFileNotFoundException(MyFileNotFoundException ex, WebRequest request) {
        logger.warn("File not found: {} for request {}", ex.getMessage(), request.getDescription(false));
        ApiResponse apiResponse = new ApiResponse(false, ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiResponse> handleFileStorageException(FileStorageException ex, WebRequest request) {
        logger.error("File storage error: {} for request {}", ex.getMessage(), request.getDescription(false), ex);
        ApiResponse apiResponse = new ApiResponse(false, "File operation failed: " + ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        logger.warn("Access denied: {} for request {}", ex.getMessage(), request.getDescription(false));
        ApiResponse apiResponse = new ApiResponse(false, "Access Denied: You do not have permission to perform this action.");
        return new ResponseEntity<>(apiResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse> handleUnauthorizedException(UnauthorizedException ex, WebRequest request) {
        logger.warn("Unauthorized access: {} for request {}", ex.getMessage(), request.getDescription(false));
        ApiResponse apiResponse = new ApiResponse(false, ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        logger.warn("Invalid argument: {} for request {}", ex.getMessage(), request.getDescription(false));
        ApiResponse apiResponse = new ApiResponse(false, "Invalid Input: " + ex.getMessage());
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage())
        );
        // You could also include global errors if any:
        // ex.getBindingResult().getGlobalErrors().forEach(error -> fieldErrors.put(error.getObjectName(), error.getDefaultMessage()));

        String errorMessage = fieldErrors.entrySet().stream()
                .map(entry -> String.format("Field '%s': %s", entry.getKey(), entry.getValue()))
                .collect(Collectors.joining("; "));

        logger.warn("Validation error: {} for request {}", fieldErrors, request.getDescription(false));
        ApiResponse apiResponse = new ApiResponse(false, "Validation failed: " + errorMessage);
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse> handleMaxSizeException(MaxUploadSizeExceededException ex, WebRequest request) {
        logger.warn("File upload size exceeded: {} for request {}", ex.getMessage(), request.getDescription(false));
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ApiResponse(false, "File too large! Maximum size allowed is configured by the server."));
    }

    @ExceptionHandler(MultipartException.class) // Catch more general multipart issues
    public ResponseEntity<ApiResponse> handleMultipartException(MultipartException ex, WebRequest request) {
        logger.error("Multipart request processing error: {} for request {}", ex.getMessage(), request.getDescription(false), ex);
        ApiResponse apiResponse = new ApiResponse(false, "Error processing multipart request. Please ensure the data is correctly formatted.");
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGlobalException(Exception ex, WebRequest request) {
        logger.error("An unexpected error occurred for request {}:", request.getDescription(false), ex);
        ApiResponse apiResponse = new ApiResponse(false, "An unexpected error occurred. Please try again later.");
        return new ResponseEntity<>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
