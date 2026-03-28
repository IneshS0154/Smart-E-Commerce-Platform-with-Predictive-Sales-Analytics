package com.store.secms.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductResponse {
    private Long id;
    private Long sellerId;
    private String sellerName;
    private String productName;
    private String category;
    private String gender;
    private String description;
    private List<String> colors;
    private String mainImagePath;
    private List<String> additionalImagePaths;
    private BigDecimal price;
    private List<StockItemDTO> stocks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor
    public ProductResponse() {}

    public ProductResponse(Long id, Long sellerId, String sellerName, String productName, String category, 
                          String gender, String description, List<String> colors, String mainImagePath,
                          List<String> additionalImagePaths, BigDecimal price, List<StockItemDTO> stocks,
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.productName = productName;
        this.category = category;
        this.gender = gender;
        this.description = description;
        this.colors = colors;
        this.mainImagePath = mainImagePath;
        this.additionalImagePaths = additionalImagePaths;
        this.price = price;
        this.stocks = stocks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getColors() { return colors; }
    public void setColors(List<String> colors) { this.colors = colors; }

    public String getMainImagePath() { return mainImagePath; }
    public void setMainImagePath(String mainImagePath) { this.mainImagePath = mainImagePath; }

    public List<String> getAdditionalImagePaths() { return additionalImagePaths; }
    public void setAdditionalImagePaths(List<String> additionalImagePaths) { this.additionalImagePaths = additionalImagePaths; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public List<StockItemDTO> getStocks() { return stocks; }
    public void setStocks(List<StockItemDTO> stocks) { this.stocks = stocks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Inner class for stock details
    public static class StockItemDTO {
        private String size;
        private Integer stockCount;

        public StockItemDTO(String size, Integer stockCount) {
            this.size = size;
            this.stockCount = stockCount;
        }

        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }

        public Integer getStockCount() { return stockCount; }
        public void setStockCount(Integer stockCount) { this.stockCount = stockCount; }
    }
}
