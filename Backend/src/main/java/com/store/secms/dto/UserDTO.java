package com.SmartCommerce.dto;

import com.SmartCommerce.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserDTO(
    Long id,
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    String username,
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    String email,
    
    String firstName,
    String lastName,
    UserRole role,
    String phoneNumber,
    String address,
    Boolean isActive
) {}
