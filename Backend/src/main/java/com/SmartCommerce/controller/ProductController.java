package com.SmartCommerce.controller;

import com.SmartCommerce.dto.ProductRequestDTO;
import com.SmartCommerce.dto.ProductResponseDTO;
import com.SmartCommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPLIER')")
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO request) {
        ProductResponseDTO response = productService.createProduct(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        List<ProductResponseDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductResponseDTO>> getActiveProducts() {
        List<ProductResponseDTO> products = productService.getActiveProducts();
        if (products.isEmpty()) {
            return ResponseEntity.ok(createDemoProducts());
        }
        return ResponseEntity.ok(products);
    }

    @GetMapping("/demo")
    public ResponseEntity<List<ProductResponseDTO>> getDemoProducts() {
        return ResponseEntity.ok(createDemoProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        try {
            ProductResponseDTO product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            List<ProductResponseDTO> demoProducts = createDemoProducts();
            for (ProductResponseDTO p : demoProducts) {
                if (p.id().equals(id)) {
                    return ResponseEntity.ok(p);
                }
            }
            throw e;
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(@PathVariable String category) {
        List<ProductResponseDTO> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(@RequestParam String keyword) {
        List<ProductResponseDTO> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPLIER')")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO request) {
        ProductResponseDTO response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponseDTO> toggleProductActive(@PathVariable Long id) {
        ProductResponseDTO response = productService.toggleProductActive(id);
        return ResponseEntity.ok(response);
    }

    private List<ProductResponseDTO> createDemoProducts() {
        List<ProductResponseDTO> demoProducts = new ArrayList<>();
        
        demoProducts.add(new ProductResponseDTO(1L, "ULTRABOOST 22", 
            "Experience incredible energy return with the Ultraboost 22.", 
            new BigDecimal("189.99"), 50, "Running", "Adidas", 
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
            "UB22-BLK", true, 1L, "Premium Sports Supply", 0.0, 0, null, null));
        
        demoProducts.add(new ProductResponseDTO(2L, "NMD_R1", 
            "The NMD_R1 blends heritage style with modern innovation.", 
            new BigDecimal("149.99"), 35, "Lifestyle", "Adidas", 
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
            "NMD-WHT", true, 1L, "Premium Sports Supply", 0.0, 0, null, null));
        
        demoProducts.add(new ProductResponseDTO(3L, "STAN SMITH", 
            "The iconic Stan Smith sneaker. Clean, simple, timeless.", 
            new BigDecimal("109.99"), 75, "Lifestyle", "Adidas", 
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500",
            "STAN-WHT", true, 1L, "Premium Sports Supply", 0.0, 0, null, null));
        
        demoProducts.add(new ProductResponseDTO(4L, "SUPERNOVA", 
            "Designed for comfort and performance.", 
            new BigDecimal("129.99"), 40, "Running", "Adidas", 
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            "SUP-BLU", true, 1L, "Premium Sports Supply", 0.0, 0, null, null));
        
        demoProducts.add(new ProductResponseDTO(5L, "FORUM LOW", 
            "The Forum Low brings retro basketball style to the streets.", 
            new BigDecimal("119.99"), 30, "Basketball", "Adidas", 
            "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500",
            "FORUM-WHT", true, 1L, "Premium Sports Supply", 0.0, 0, null, null));
        
        demoProducts.add(new ProductResponseDTO(6L, "GAZELLE", 
            "The Gazelle is a timeless classic.", 
            new BigDecimal("99.99"), 60, "Lifestyle", "Adidas", 
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500",
            "GAZ-NAV", true, 1L, "Premium Sports Supply", 0.0, 0, null, null));
        
        return demoProducts;
    }
}
