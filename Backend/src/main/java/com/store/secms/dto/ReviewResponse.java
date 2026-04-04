package com.store.secms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long productId;
    private String productName;
    private String productImage;
    private String sellerName;
    private Long orderItemId;
    private Long orderId;
    private String transactionId;
    private Integer rating;
    private String reviewText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean canEdit;
    private boolean canDelete;
}
