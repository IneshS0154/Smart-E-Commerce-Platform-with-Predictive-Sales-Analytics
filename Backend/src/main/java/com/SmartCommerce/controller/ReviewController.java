package com.SmartCommerce.controller;

import com.SmartCommerce.dto.ReviewRequestDTO;
import com.SmartCommerce.dto.ReviewResponseDTO;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.service.ReviewService;
import com.SmartCommerce.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewRequestDTO request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        ReviewResponseDTO response = reviewService.createReview(user.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByProduct(
            @PathVariable Long productId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByProduct(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByUser(
            @PathVariable Long userId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> getReviewById(
            @PathVariable Long reviewId) {
        ReviewResponseDTO review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> updateReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequestDTO request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        ReviewResponseDTO response = reviewService.updateReview(reviewId, user.getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        reviewService.deleteReview(reviewId, user.getId(), isAdmin);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{reviewId}/flag")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewResponseDTO> flagReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        ReviewResponseDTO response = reviewService.flagReview(reviewId, reason);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewResponseDTO> approveReview(
            @PathVariable Long reviewId) {
        ReviewResponseDTO response = reviewService.approveReview(reviewId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/flagged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewResponseDTO>> getFlaggedReviews() {
        List<ReviewResponseDTO> reviews = reviewService.getFlaggedReviews();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewResponseDTO>> getPendingReviews() {
        List<ReviewResponseDTO> reviews = reviewService.getPendingReviews();
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<ReviewResponseDTO> markReviewHelpful(
            @PathVariable Long reviewId) {
        ReviewResponseDTO response = reviewService.markHelpful(reviewId);
        return ResponseEntity.ok(response);
    }
}
