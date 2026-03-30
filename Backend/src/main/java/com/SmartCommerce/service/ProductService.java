package com.SmartCommerce.service;

import com.SmartCommerce.dto.ProductRequestDTO;
import com.SmartCommerce.dto.ProductResponseDTO;
import com.SmartCommerce.entity.Product;
import com.SmartCommerce.entity.Supplier;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.ProductRepository;
import com.SmartCommerce.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        if (request.sku() != null && productRepository.existsBySku(request.sku())) {
            throw new BadRequestException("SKU already exists: " + request.sku());
        }

        Product product = Product.builder()
            .name(request.name())
            .description(request.description())
            .price(request.price())
            .stockQuantity(request.stockQuantity())
            .category(request.category())
            .brand(request.brand())
            .imageUrl(request.imageUrl())
            .sku(request.sku())
            .active(true)
            .averageRating(0.0)
            .reviewCount(0)
            .build();

        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.supplierId()));
            product.setSupplier(supplier);
        }

        Product savedProduct = productRepository.save(product);
        return mapToResponseDTO(savedProduct);
    }

    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    public List<ProductResponseDTO> getActiveProducts() {
        return productRepository.findByActiveTrue().stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponseDTO(product);
    }

    public Product getProductEntityById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<ProductResponseDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    public List<ProductResponseDTO> searchProducts(String keyword) {
        return productRepository.searchByName(keyword).stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (request.sku() != null && !request.sku().equals(product.getSku()) 
            && productRepository.existsBySku(request.sku())) {
            throw new BadRequestException("SKU already exists: " + request.sku());
        }

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setCategory(request.category());
        product.setBrand(request.brand());
        product.setImageUrl(request.imageUrl());
        product.setSku(request.sku());

        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.supplierId()));
            product.setSupplier(supplier);
        }

        Product updatedProduct = productRepository.save(product);
        return mapToResponseDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public ProductResponseDTO toggleProductActive(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        product.setActive(!product.isActive());
        
        Product updatedProduct = productRepository.save(product);
        return mapToResponseDTO(updatedProduct);
    }

    private ProductResponseDTO mapToResponseDTO(Product product) {
        return new ProductResponseDTO(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getStockQuantity(),
            product.getCategory(),
            product.getBrand(),
            product.getImageUrl(),
            product.getSku(),
            product.isActive(),
            product.getSupplier() != null ? product.getSupplier().getId() : null,
            product.getSupplier() != null ? product.getSupplier().getName() : null,
            product.getAverageRating(),
            product.getReviewCount(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
}
