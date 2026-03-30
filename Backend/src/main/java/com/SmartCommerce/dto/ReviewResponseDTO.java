package com.SmartCommerce.dto;

import java.time.LocalDateTime;

public record ReviewResponseDTO(
    Long id,
    Long productId,
    String productName,
    Long userId,
    String userFirstName,
    String userLastName,
    Integer rating,
    String comment,
    boolean approved,
    boolean flagged,
    String flagReason,
    Integer helpfulCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
