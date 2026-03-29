package com.store.secms.dto;

import java.math.BigDecimal;
import java.util.Map;

public class StockUpdateRequest {
    private BigDecimal price;
    private Map<String, Integer> sizeStocks;  // e.g., {"S": 10, "M": 15, "L": 20}

    // Constructor
    public StockUpdateRequest() {}

    public StockUpdateRequest(BigDecimal price, Map<String, Integer> sizeStocks) {
        this.price = price;
        this.sizeStocks = sizeStocks;
    }

    // Getters and Setters
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Map<String, Integer> getSizeStocks() { return sizeStocks; }
    public void setSizeStocks(Map<String, Integer> sizeStocks) { this.sizeStocks = sizeStocks; }
}
