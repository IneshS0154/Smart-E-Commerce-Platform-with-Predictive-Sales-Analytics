package com.store.secms.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateCouponRequest {
    private String code;
    private String description;
    private BigDecimal discountPercentage;
    private BigDecimal minimumOrderAmount;
    private Integer maxUsages;
    private String validFrom;   // ISO string: "2026-04-01T00:00:00"
    private String validUntil;  // ISO string: "2026-06-30T23:59:59"
    private Long sellerId;
}
