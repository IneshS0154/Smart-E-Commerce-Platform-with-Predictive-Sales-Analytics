package com.store.secms.controller;

import com.store.secms.dto.MessageResponse;
import com.store.secms.dto.OrderItemForReviewDTO;
import com.store.secms.dto.ReviewRequest;
import com.store.secms.dto.ReviewResponse;
import com.store.secms.entity.Customer;
import com.store.secms.entity.Review;
import com.store.secms.repository.CustomerRepository;
import com.store.secms.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CustomerRepository customerRepository;

    public ReviewController(ReviewService reviewService, CustomerRepository customerRepository) {
        this.reviewService = reviewService;
        this.customerRepository = customerRepository;
    }

    private Long getCurrentCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return customer.getId();
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request) {
        Long customerId = getCurrentCustomerId();
        Review review = reviewService.createReview(customerId, request);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(@PathVariable Long reviewId, @RequestBody ReviewRequest request) {
        Long customerId = getCurrentCustomerId();
        Review review = reviewService.updateReview(reviewId, customerId, request);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<MessageResponse> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(new MessageResponse("Review deleted successfully"));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {
        Long customerId = getCurrentCustomerId();
        List<ReviewResponse> reviews = reviewService.getCustomerReviews(customerId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<OrderItemForReviewDTO>> getRecentOrdersForReview() {
        Long customerId = getCurrentCustomerId();
        List<OrderItemForReviewDTO> orderItems = reviewService.getRecentOrderItemsForReview(customerId);
        return ResponseEntity.ok(orderItems);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long productId) {
        Double average = reviewService.getAverageRatingForProduct(productId);
        return ResponseEntity.ok(average != null ? average : 0.0);
    }

    @GetMapping("/product/{productId}/count")
    public ResponseEntity<Long> getReviewCount(@PathVariable Long productId) {
        Long count = reviewService.getReviewCountForProduct(productId);
        return ResponseEntity.ok(count != null ? count : 0L);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        List<ReviewResponse> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ReviewResponse>> getSellerReviews(@PathVariable Long sellerId) {
        List<ReviewResponse> reviews = reviewService.getSellerReviews(sellerId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/seller/{sellerId}/average")
    public ResponseEntity<Double> getSellerAverageRating(@PathVariable Long sellerId) {
        Double average = reviewService.getAverageRatingForSeller(sellerId);
        return ResponseEntity.ok(average != null ? average : 0.0);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long reviewId) {
        ReviewResponse review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(review);
    }
}
