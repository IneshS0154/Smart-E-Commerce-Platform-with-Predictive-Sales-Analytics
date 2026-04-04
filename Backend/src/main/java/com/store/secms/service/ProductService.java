package com.store.secms.service;

import com.store.secms.dto.AddProductRequest;
import com.store.secms.dto.ProductResponse;
import com.store.secms.dto.ProductResponse.StockItemDTO;
import com.store.secms.dto.StockUpdateRequest;
import com.store.secms.entity.*;
import com.store.secms.entity.Product.ProductCategory;
import com.store.secms.entity.Product.ProductGender;
import com.store.secms.entity.ProductStock.SizeEnum;
import com.store.secms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ProductStockRepository productStockRepository;

    @Autowired
    private SellerRepository sellerRepository;

    /**
     * Add a new product with stocks for all sizes
     */
    @Transactional
    public ProductResponse addProduct(Long sellerId, AddProductRequest request) {
        // Verify seller exists
        Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            throw new IllegalArgumentException("Seller not found");
        }

        Seller seller = sellerOpt.get();

        // Create product
        Product product = new Product();
        product.setSeller(seller);
        product.setProductName(request.getProductName());
        product.setCategory(ProductCategory.valueOf(request.getCategory().toUpperCase()));
        product.setGender(ProductGender.valueOf(request.getGender().toUpperCase()));
        product.setDescription(request.getDescription());
        product.setAvailableColors(request.getAvailableColors());
        product.setMainImagePath(request.getMainImagePath());

        // Save product
        Product savedProduct = productRepository.save(product);

        // Add main image record
        ProductImage mainImage = new ProductImage();
        mainImage.setProduct(savedProduct);
        mainImage.setImagePath(request.getMainImagePath());
        mainImage.setImageOrder(0);
        productImageRepository.save(mainImage);

        // Add additional images
        if (request.getAdditionalImagePaths() != null && !request.getAdditionalImagePaths().isEmpty()) {
            for (int i = 0; i < request.getAdditionalImagePaths().size() && i < 3; i++) {
                ProductImage additionalImage = new ProductImage();
                additionalImage.setProduct(savedProduct);
                additionalImage.setImagePath(request.getAdditionalImagePaths().get(i));
                additionalImage.setImageOrder(i + 1);
                productImageRepository.save(additionalImage);
            }
        }

        // Create stock entries for all sizes
        BigDecimal defaultPrice = new BigDecimal("0");
        for (SizeEnum size : SizeEnum.values()) {
            ProductStock stock = new ProductStock();
            stock.setProduct(savedProduct);
            stock.setSize(size);
            stock.setPrice(defaultPrice);
            stock.setStockCount(0);
            productStockRepository.save(stock);
        }

        return convertToResponse(savedProduct);
    }

    /**
     * Get all products for a supplier
     */
    public List<ProductResponse> getSupplierProducts(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get products for a specific catalogue section
     */
    public List<ProductResponse> getProductsByCatalogueSection(String gender, String category) {
        ProductGender genderEnum = ProductGender.valueOf(gender.toUpperCase());
        ProductCategory categoryEnum = ProductCategory.valueOf(category.toUpperCase());
        List<Product> products = productRepository.findByGenderAndCategory(genderEnum, categoryEnum);
        return products.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a single product with all details
     */
    public ProductResponse getProduct(Long productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Product not found");
        }
        return convertToResponse(productOpt.get());
    }

    /**
     * Update product details (name, description, colors)
     */
    @Transactional
    public ProductResponse updateProduct(Long productId, AddProductRequest request) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Product not found");
        }

        Product product = productOpt.get();
        product.setProductName(request.getProductName());
        product.setCategory(ProductCategory.valueOf(request.getCategory().toUpperCase()));
        product.setGender(ProductGender.valueOf(request.getGender().toUpperCase()));
        product.setDescription(request.getDescription());
        product.setAvailableColors(request.getAvailableColors());

        // Update images if provided
        if (request.getMainImagePath() != null) {
            product.setMainImagePath(request.getMainImagePath());
            // Delete and recreate image records
            productImageRepository.deleteByProductId(productId);
            
            ProductImage mainImage = new ProductImage();
            mainImage.setProduct(product);
            mainImage.setImagePath(request.getMainImagePath());
            mainImage.setImageOrder(0);
            productImageRepository.save(mainImage);

            if (request.getAdditionalImagePaths() != null && !request.getAdditionalImagePaths().isEmpty()) {
                for (int i = 0; i < request.getAdditionalImagePaths().size() && i < 3; i++) {
                    ProductImage additionalImage = new ProductImage();
                    additionalImage.setProduct(product);
                    additionalImage.setImagePath(request.getAdditionalImagePaths().get(i));
                    additionalImage.setImageOrder(i + 1);
                    productImageRepository.save(additionalImage);
                }
            }
        }

        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }

    /**
     * Delete product and cascade delete images and stocks
     */
    @Transactional
    public boolean deleteProduct(Long productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return false;
        }
        productRepository.deleteById(productId);
        return true;
    }

    /**
     * Get all images for a product
     */
    public List<String> getProductImages(Long productId) {
        return productImageRepository.findByProductId(productId)
                .stream()
                .map(ProductImage::getImagePath)
                .collect(Collectors.toList());
    }

    /**
     * Update stock counts and price for a product
     */
    @Transactional
    public ProductResponse updateProductStock(Long productId, StockUpdateRequest request) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Product not found");
        }

        Product product = productOpt.get();

        // Update price for all sizes
        if (request.getPrice() != null && request.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            List<ProductStock> stocks = productStockRepository.findByProductId(productId);
            for (ProductStock stock : stocks) {
                stock.setPrice(request.getPrice());
                productStockRepository.save(stock);
            }
        }

        // Update stock counts for specific sizes
        if (request.getSizeStocks() != null) {
            for (Map.Entry<String, Integer> entry : request.getSizeStocks().entrySet()) {
                try {
                    SizeEnum size = SizeEnum.valueOf(entry.getKey().toUpperCase());
                    Optional<ProductStock> stockOpt = productStockRepository.findByProductIdAndSize(productId, size);
                    if (stockOpt.isPresent()) {
                        ProductStock stock = stockOpt.get();
                        stock.setStockCount(entry.getValue());
                        productStockRepository.save(stock);
                    }
                } catch (IllegalArgumentException e) {
                    // Skip invalid size enum
                    continue;
                }
            }
        }

        return convertToResponse(product);
    }

    /**
     * Convert Product entity to ProductResponse DTO
     */
    private ProductResponse convertToResponse(Product product) {
        List<ProductStock> stocks = productStockRepository.findByProductId(product.getId());
        BigDecimal price = stocks.isEmpty() ? BigDecimal.ZERO : stocks.get(0).getPrice();

        List<StockItemDTO> stockItems = stocks.stream()
                .map(s -> new StockItemDTO(s.getSize().toString(), s.getStockCount()))
                .collect(Collectors.toList());

        List<ProductImage> images = productImageRepository.findByProductId(product.getId());
        List<String> additionalImages = images.stream()
                .filter(img -> img.getImageOrder() > 0)
                .map(ProductImage::getImagePath)
                .collect(Collectors.toList());

        return new ProductResponse(
                product.getId(),
                product.getSeller().getId(),
                product.getSeller().getStoreName(),
                product.getProductName(),
                product.getCategory().toString(),
                product.getGender().toString(),
                product.getDescription(),
                product.getAvailableColors(),
                product.getMainImagePath(),
                additionalImages,
                price,
                stockItems,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    /**
     * Returns the newest `limit` products for each gender, combined into one list.
     * Order: MALE products first (newest-first), then FEMALE products (newest-first).
     */
    public List<ProductResponse> getNewArrivals(int limitPerGender) {
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(0, limitPerGender);

        List<Product> males   = productRepository.findByGenderOrderByCreatedAtDesc(ProductGender.MALE,   pageable);
        List<Product> females = productRepository.findByGenderOrderByCreatedAtDesc(ProductGender.FEMALE, pageable);

        List<ProductResponse> result = new ArrayList<>();
        males.forEach(p   -> result.add(convertToResponse(p)));
        females.forEach(p -> result.add(convertToResponse(p)));
        return result;
    }
}
