package com.SmartCommerce.dto;

import java.time.LocalDateTime;

public record UserResponseDTO(
    Long id,
    String email,
    String firstName,
    String lastName,
    String phone,
    String role,
    boolean enabled,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
