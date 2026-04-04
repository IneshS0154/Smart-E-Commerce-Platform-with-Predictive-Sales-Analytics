package com.store.secms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemForReviewDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private String size;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private Long orderId;
    private String transactionId;
    private String sellerName;
    private Long sellerId;
    private LocalDateTime orderDate;
    private boolean canReview;
    private boolean hasReview;
    private Long reviewId;
}
