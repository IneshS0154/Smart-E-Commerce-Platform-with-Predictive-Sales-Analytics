package com.SmartCommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponseDTO(
    Long id,
    String name,
    String description,
    BigDecimal price,
    Integer stockQuantity,
    String category,
    String brand,
    String imageUrl,
    String sku,
    boolean active,
    Long supplierId,
    String supplierName,
    Double averageRating,
    Integer reviewCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
