package com.store.secms.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String couponCode;
    private String shippingAddress;
    private String cardNumber;
    private String cardType;
    private String expiryDate;
    private String cvv;
    private String cardHolderName;
}
