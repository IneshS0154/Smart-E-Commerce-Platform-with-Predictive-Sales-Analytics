package com.SmartCommerce.dto;

public record ApiResponseDTO<T>(
    boolean success,
    String message,
    T data
) {
    public static <T> ApiResponseDTO<T> success(String message, T data) {
        return new ApiResponseDTO<>(true, message, data);
    }
    
    public static <T> ApiResponseDTO<T> error(String message) {
        return new ApiResponseDTO<>(false, message, null);
    }
}
