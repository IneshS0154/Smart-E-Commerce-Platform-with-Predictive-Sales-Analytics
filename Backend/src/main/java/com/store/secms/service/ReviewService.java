package com.store.secms.service;

import com.store.secms.dto.OrderItemForReviewDTO;
import com.store.secms.dto.ReviewRequest;
import com.store.secms.dto.ReviewResponse;
import com.store.secms.entity.*;
import com.store.secms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, OrderItemRepository orderItemRepository,
                         OrderRepository orderRepository, CustomerRepository customerRepository,
                         ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Review createReview(Long customerId, ReviewRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if customer owns this order
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("You can only review your own orders");
        }

        // Check if already reviewed
        Optional<Review> existingReview = reviewRepository.findByOrderItemId(orderItem.getId());
        if (existingReview.isPresent()) {
            throw new RuntimeException("You have already reviewed this item");
        }

        // Check if within 7 days
        if (!canReview(order.getCreatedAt())) {
            throw new RuntimeException("Review period has expired. You can only review within 7 days of purchase");
        }

        // Validate rating
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Review review = new Review();
        review.setCustomer(customer);
        review.setProduct(product);
        review.setOrderItem(orderItem);
        review.setOrder(order);
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        return reviewRepository.save(review);
    }

    @Transactional
    public Review updateReview(Long reviewId, Long customerId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Check if customer owns this review
        if (!review.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("You can only edit your own reviews");
        }

        // Check if within 1 day of creation
        if (!canEdit(review.getCreatedAt())) {
            throw new RuntimeException("Edit period has expired. You can only edit within 1 day of posting");
        }

        // Validate rating
        if (request.getRating() != null) {
            if (request.getRating() < 1 || request.getRating() > 5) {
                throw new RuntimeException("Rating must be between 1 and 5");
            }
            review.setRating(request.getRating());
        }

        if (request.getReviewText() != null) {
            review.setReviewText(request.getReviewText());
        }

        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        reviewRepository.delete(review);
    }

    public List<OrderItemForReviewDTO> getRecentOrderItemsForReview(Long customerId) {
        // Get orders from last month
        LocalDateTime oneMonthAgo = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);

        List<OrderItem> orderItems = orderItemRepository.findByCustomerIdAndOrderDateAfter(customerId, oneMonthAgo);

        return orderItems.stream()
                .map(item -> {
                    OrderItemForReviewDTO dto = new OrderItemForReviewDTO();
                    dto.setId(item.getId());
                    dto.setProductId(item.getProduct().getId());
                    dto.setProductName(item.getProduct().getProductName());
                    dto.setProductImage(item.getProduct().getMainImagePath());
                    dto.setSize(item.getSize());
                    dto.setPrice(item.getPrice());
                    dto.setQuantity(item.getQuantity());
                    dto.setSubtotal(item.getSubtotal());
                    dto.setOrderId(item.getOrder().getId());
                    dto.setTransactionId(item.getOrder().getTransactionId());
                    dto.setSellerName(item.getProduct().getSeller().getStoreName());
                    dto.setSellerId(item.getProduct().getSeller().getId());
                    dto.setOrderDate(item.getOrder().getCreatedAt());

                    // Check if can review (within 7 days)
                    dto.setCanReview(canReview(item.getOrder().getCreatedAt()));

                    // Check if already reviewed
                    Optional<Review> existingReview = reviewRepository.findByOrderItemId(item.getId());
                    dto.setHasReview(existingReview.isPresent());
                    dto.setReviewId(existingReview.map(Review::getId).orElse(null));

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getCustomerReviews(Long customerId) {
        List<Review> reviews = reviewRepository.findByCustomerId(customerId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getProductReviews(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAllWithDetails();
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getSellerReviews(Long sellerId) {
        List<Review> reviews = reviewRepository.findBySellerId(sellerId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findByIdWithDetails(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return convertToResponse(review);
    }

    public Double getAverageRatingForProduct(Long productId) {
        return reviewRepository.calculateAverageRatingForProduct(productId);
    }

    public Long getReviewCountForProduct(Long productId) {
        return reviewRepository.countByProductId(productId);
    }

    public Double getAverageRatingForSeller(Long sellerId) {
        return reviewRepository.calculateAverageRatingForSeller(sellerId);
    }

    private ReviewResponse convertToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setCustomerId(review.getCustomer().getId());
        response.setCustomerName(review.getCustomer().getFirstName() + " " + review.getCustomer().getLastName());
        response.setProductId(review.getProduct().getId());
        response.setProductName(review.getProduct().getProductName());
        response.setProductImage(review.getProduct().getMainImagePath());
        response.setSellerName(review.getProduct().getSeller().getStoreName());
        response.setOrderItemId(review.getOrderItem().getId());
        response.setOrderId(review.getOrder().getId());
        response.setTransactionId(review.getOrder().getTransactionId());
        response.setRating(review.getRating());
        response.setReviewText(review.getReviewText());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        response.setCanEdit(canEdit(review.getCreatedAt()));
        response.setCanDelete(true);
        return response;
    }

    // Can review within 7 days of order
    public boolean canReview(LocalDateTime orderDate) {
        return ChronoUnit.DAYS.between(orderDate, LocalDateTime.now()) <= 7;
    }

    // Can edit within 1 day of review creation
    public boolean canEdit(LocalDateTime reviewDate) {
        return ChronoUnit.DAYS.between(reviewDate, LocalDateTime.now()) <= 1;
    }
}
