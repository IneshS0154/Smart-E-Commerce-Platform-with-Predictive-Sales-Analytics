package com.SmartCommerce.dto;

import com.SmartCommerce.entity.UserRole;

public record AuthResponseDTO(
    String token,
    String username,
    String email,
    UserRole role,
    String message
) {}
