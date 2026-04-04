package com.store.secms.dto;

import java.util.List;

public class AddProductRequest {
    private String productName;
    private String category;  // matches ProductCategory enum
    private String gender;     // matches ProductGender enum
    private String description;
    private List<String> availableColors;
    private String mainImagePath;
    private List<String> additionalImagePaths;

    // Constructors
    public AddProductRequest() {}

    public AddProductRequest(String productName, String category, String gender, String description, 
                            List<String> availableColors, String mainImagePath, List<String> additionalImagePaths) {
        this.productName = productName;
        this.category = category;
        this.gender = gender;
        this.description = description;
        this.availableColors = availableColors;
        this.mainImagePath = mainImagePath;
        this.additionalImagePaths = additionalImagePaths;
    }

    // Getters and Setters
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getAvailableColors() { return availableColors; }
    public void setAvailableColors(List<String> availableColors) { this.availableColors = availableColors; }

    public String getMainImagePath() { return mainImagePath; }
    public void setMainImagePath(String mainImagePath) { this.mainImagePath = mainImagePath; }

    public List<String> getAdditionalImagePaths() { return additionalImagePaths; }
    public void setAdditionalImagePaths(List<String> additionalImagePaths) { this.additionalImagePaths = additionalImagePaths; }
}
