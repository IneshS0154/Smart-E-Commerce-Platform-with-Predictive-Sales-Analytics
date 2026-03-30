package com.SmartCommerce.repository;

import com.SmartCommerce.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByProductIdAndApprovedTrue(Long productId);
    
    List<Review> findByUserId(Long userId);
    
    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);
    
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    List<Review> findByFlaggedTrue();
    
    List<Review> findByApprovedFalse();
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Double calculateAverageRating(@Param("productId") Long productId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Integer countApprovedReviews(@Param("productId") Long productId);
    
    @Modifying
    @Query("UPDATE Product p SET p.averageRating = (SELECT AVG(r.rating) FROM Review r WHERE r.product.id = p.id AND r.approved = true), p.reviewCount = (SELECT COUNT(r) FROM Review r WHERE r.product.id = p.id AND r.approved = true) WHERE p.id = :productId")
    void updateProductRating(@Param("productId") Long productId);
}
