package com.store.secms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    private Long orderItemId;
    private Long productId;
    private Long orderId;
    private Integer rating;
    private String reviewText;
}
