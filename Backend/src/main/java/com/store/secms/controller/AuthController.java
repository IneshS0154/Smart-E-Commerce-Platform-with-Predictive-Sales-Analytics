package com.SmartCommerce.controller;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.entity.UserRole;
import com.SmartCommerce.service.AuthService;
import com.SmartCommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDTO<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            AuthResponseDTO response = authService.login(request);
            return ResponseEntity.ok(ApiResponseDTO.success("Login successful", response));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponseDTO<AuthResponseDTO>> register(@Valid @RequestBody RegisterRequestDTO request) {
        try {
            AuthResponseDTO response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Registration successful", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponseDTO.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponseDTO<UserDTO>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserDTO user = authService.getCurrentUser(username);
        return ResponseEntity.ok(ApiResponseDTO.success("User fetched successfully", user));
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<ApiResponseDTO<Map<String, Boolean>>> checkUsername(@PathVariable String username) {
        boolean available = authService.isUsernameAvailable(username);
        return ResponseEntity.ok(ApiResponseDTO.success("Username availability checked", Map.of("available", available)));
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponseDTO<Map<String, Boolean>>> checkEmail(@PathVariable String email) {
        boolean available = authService.isEmailAvailable(email);
        return ResponseEntity.ok(ApiResponseDTO.success("Email availability checked", Map.of("available", available)));
    }
}
