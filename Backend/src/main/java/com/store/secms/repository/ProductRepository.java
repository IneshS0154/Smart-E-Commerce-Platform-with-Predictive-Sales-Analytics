package com.store.secms.repository;

import com.store.secms.entity.Product;
import com.store.secms.entity.Product.ProductCategory;
import com.store.secms.entity.Product.ProductGender;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId);
    
    List<Product> findByGenderAndCategory(ProductGender gender, ProductCategory category);
    
    List<Product> findBySellerIdAndCategory(Long sellerId, ProductCategory category);
    
    List<Product> findBySellerIdAndGender(Long sellerId, ProductGender gender);
    
    List<Product> findBySellerIdAndGenderAndCategory(Long sellerId, ProductGender gender, ProductCategory category);
}
