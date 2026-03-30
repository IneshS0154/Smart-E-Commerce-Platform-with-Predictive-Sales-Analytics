package com.SmartCommerce.service;

import com.SmartCommerce.dto.ReviewRequestDTO;
import com.SmartCommerce.dto.ReviewResponseDTO;
import com.SmartCommerce.entity.Product;
import com.SmartCommerce.entity.Review;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.ProductRepository;
import com.SmartCommerce.repository.ReviewRepository;
import com.SmartCommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public ReviewResponseDTO createReview(Long userId, ReviewRequestDTO request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(request.productId()).orElse(null);
        
        if (product == null) {
            product = createDemoProduct(request.productId());
        }

        if (reviewRepository.existsByUserIdAndProductId(userId, request.productId())) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Review review = Review.builder()
            .user(user)
            .product(product)
            .rating(request.rating())
            .comment(request.comment())
            .approved(true)
            .flagged(false)
            .helpfulCount(0)
            .build();

        Review savedReview = reviewRepository.save(review);
        
        updateProductRating(product.getId());

        return mapToResponseDTO(savedReview);
    }

    public List<ReviewResponseDTO> getReviewsByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        List<Review> reviews = reviewRepository.findByProductIdAndApprovedTrue(productId);
        return reviews.stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    public List<ReviewResponseDTO> getReviewsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        List<Review> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    public ReviewResponseDTO getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        return mapToResponseDTO(review);
    }

    @Transactional
    public ReviewResponseDTO updateReview(Long reviewId, Long userId, ReviewRequestDTO request) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only update your own reviews");
        }

        review.setRating(request.rating());
        review.setComment(request.comment());

        Review updatedReview = reviewRepository.save(review);
        
        updateProductRating(review.getProduct().getId());

        return mapToResponseDTO(updatedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        Long productId = review.getProduct().getId();
        
        reviewRepository.delete(review);
        
        updateProductRating(productId);
    }

    @Transactional
    public ReviewResponseDTO flagReview(Long reviewId, String reason) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        review.setFlagged(true);
        review.setFlagReason(reason);
        review.setApproved(false);

        Review savedReview = reviewRepository.save(review);
        
        updateProductRating(review.getProduct().getId());

        return mapToResponseDTO(savedReview);
    }

    @Transactional
    public ReviewResponseDTO approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        review.setApproved(true);
        review.setFlagged(false);
        review.setFlagReason(null);

        Review savedReview = reviewRepository.save(review);
        
        updateProductRating(review.getProduct().getId());

        return mapToResponseDTO(savedReview);
    }

    public List<ReviewResponseDTO> getFlaggedReviews() {
        List<Review> reviews = reviewRepository.findByFlaggedTrue();
        return reviews.stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    public List<ReviewResponseDTO> getPendingReviews() {
        List<Review> reviews = reviewRepository.findByApprovedFalse();
        return reviews.stream()
            .map(this::mapToResponseDTO)
            .toList();
    }

    @Transactional
    public ReviewResponseDTO markHelpful(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        review.setHelpfulCount(review.getHelpfulCount() + 1);
        
        Review savedReview = reviewRepository.save(review);
        
        return mapToResponseDTO(savedReview);
    }

    private void updateProductRating(Long productId) {
        Double averageRating = reviewRepository.calculateAverageRating(productId);
        Integer reviewCount = reviewRepository.countApprovedReviews(productId);
        
        if (averageRating == null) {
            averageRating = 0.0;
        }
        if (reviewCount == null) {
            reviewCount = 0;
        }

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        product.setAverageRating(averageRating);
        product.setReviewCount(reviewCount);
        
        productRepository.save(product);
    }

    private ReviewResponseDTO mapToResponseDTO(Review review) {
        return new ReviewResponseDTO(
            review.getId(),
            review.getProduct().getId(),
            review.getProduct().getName(),
            review.getUser().getId(),
            review.getUser().getFirstName(),
            review.getUser().getLastName(),
            review.getRating(),
            review.getComment(),
            review.isApproved(),
            review.isFlagged(),
            review.getFlagReason(),
            review.getHelpfulCount(),
            review.getCreatedAt(),
            review.getUpdatedAt()
        );
    }

    private Product createDemoProduct(Long productId) {
        Product product = new Product();
        product.setId(productId);
        
        switch (productId.intValue()) {
            case 1 -> product.setName("ULTRABOOST 22");
            case 2 -> product.setName("NMD_R1");
            case 3 -> product.setName("STAN SMITH");
            case 4 -> product.setName("SUPERNOVA");
            case 5 -> product.setName("FORUM LOW");
            case 6 -> product.setName("GAZELLE");
            default -> product.setName("Product " + productId);
        }
        
        product.setDescription("Premium quality product");
        product.setPrice(new BigDecimal("99.99"));
        product.setStockQuantity(100);
        product.setCategory("Lifestyle");
        product.setBrand("Adidas");
        product.setActive(true);
        product.setAverageRating(0.0);
        product.setReviewCount(0);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        
        return product;
    }
}
