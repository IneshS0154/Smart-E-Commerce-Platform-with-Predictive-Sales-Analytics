package com.store.secms.repository;

import com.store.secms.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.customer c LEFT JOIN FETCH r.product p LEFT JOIN FETCH p.seller s WHERE r.customer.id = :customerId ORDER BY r.createdAt DESC")
    List<Review> findByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.customer c LEFT JOIN FETCH r.product p LEFT JOIN FETCH p.seller s WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    List<Review> findByProductId(@Param("productId") Long productId);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.customer c LEFT JOIN FETCH r.product p LEFT JOIN FETCH p.seller s WHERE p.seller.id = :sellerId ORDER BY r.createdAt DESC")
    List<Review> findBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.customer c LEFT JOIN FETCH r.product p LEFT JOIN FETCH p.seller s ORDER BY r.createdAt DESC")
    List<Review> findAllWithDetails();

    Optional<Review> findByOrderItemId(Long orderItemId);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.customer c LEFT JOIN FETCH r.product p LEFT JOIN FETCH p.seller s WHERE r.id = :id")
    Optional<Review> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double calculateAverageRatingForProduct(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    Long countByProductId(@Param("productId") Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.seller.id = :sellerId")
    Double calculateAverageRatingForSeller(@Param("sellerId") Long sellerId);
}
