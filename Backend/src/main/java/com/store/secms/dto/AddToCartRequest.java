package com.store.secms.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long productId;
    private String size;
    private Integer quantity;
}
