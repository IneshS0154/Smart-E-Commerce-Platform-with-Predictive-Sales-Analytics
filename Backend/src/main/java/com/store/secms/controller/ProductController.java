package com.store.secms.controller;

import com.store.secms.dto.AddProductRequest;
import com.store.secms.dto.ProductResponse;
import com.store.secms.dto.StockUpdateRequest;
import com.store.secms.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * Add a new product
     * POST /api/products/add
     */
    @PostMapping("/add")
    public ResponseEntity<?> addProduct(
            @RequestParam Long sellerId,
            @RequestBody AddProductRequest request) {
        try {
            ProductResponse response = productService.addProduct(sellerId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error adding product: " + e.getMessage()));
        }
    }

    /**
     * Get all products for a supplier
     * GET /api/products/supplier/{sellerId}
     */
    @GetMapping("/supplier/{sellerId}")
    public ResponseEntity<?> getSupplierProducts(@PathVariable Long sellerId) {
        try {
            List<ProductResponse> products = productService.getSupplierProducts(sellerId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching products: " + e.getMessage()));
        }
    }

    /**
     * Get products for a specific catalogue section
     * GET /api/products/catalogue/{gender}/{category}
     * Example: /api/products/catalogue/MALE/CASUAL_WEAR
     */
    @GetMapping("/catalogue/{gender}/{category}")
    public ResponseEntity<?> getProductsByCatalogue(
            @PathVariable String gender,
            @PathVariable String category) {
        try {
            List<ProductResponse> products = productService.getProductsByCatalogueSection(gender, category);
            return ResponseEntity.ok(products);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching catalogue products: " + e.getMessage()));
        }
    }

    /**
     * Get a single product with all details
     * GET /api/products/{productId}
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable Long productId) {
        try {
            ProductResponse product = productService.getProduct(productId);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching product: " + e.getMessage()));
        }
    }

    /**
     * Update product details
     * PUT /api/products/{productId}
     */
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @RequestBody AddProductRequest request) {
        try {
            ProductResponse response = productService.updateProduct(productId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating product: " + e.getMessage()));
        }
    }

    /**
     * Delete a product
     * DELETE /api/products/{productId}
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        try {
            boolean deleted = productService.deleteProduct(productId);
            if (deleted) {
                return ResponseEntity.ok(new MessageResponse("Product deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Product not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error deleting product: " + e.getMessage()));
        }
    }

    /**
     * Get all images for a product
     * GET /api/products/{productId}/images
     */
    @GetMapping("/{productId}/images")
    public ResponseEntity<?> getProductImages(@PathVariable Long productId) {
        try {
            List<String> images = productService.getProductImages(productId);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching images: " + e.getMessage()));
        }
    }

    /**
     * Update product stock counts and price
     * PUT /api/products/{productId}/stocks
     */
    @PutMapping("/{productId}/stocks")
    public ResponseEntity<?> updateProductStock(
            @PathVariable Long productId,
            @RequestBody StockUpdateRequest request) {
        try {
            ProductResponse response = productService.updateProductStock(productId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating stock: " + e.getMessage()));
        }
    }

    /**
     * Simple message response class
     */
    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
