package com.store.secms.controller;

import com.store.secms.dto.CreateCouponRequest;
import com.store.secms.entity.Coupon;
import com.store.secms.entity.Seller;
import com.store.secms.repository.CouponRepository;
import com.store.secms.repository.SellerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponRepository couponRepository;
    private final SellerRepository sellerRepository;

    public CouponController(CouponRepository couponRepository, SellerRepository sellerRepository) {
        this.couponRepository = couponRepository;
        this.sellerRepository = sellerRepository;
    }

    /** Validate a coupon code without creating an order — used by checkout page */
    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestParam String code) {
        Optional<Coupon> opt = couponRepository.findByCodeAndStatus(code.toUpperCase(), "ACTIVE");
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or inactive coupon code"));
        }
        Coupon c = opt.get();
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(c.getValidFrom()) || now.isAfter(c.getValidUntil())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Coupon has expired or not yet active"));
        }
        if (c.getMaxUsages() != null && c.getCurrentUsageCount() >= c.getMaxUsages()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Coupon usage limit exceeded"));
        }
        Long sellerId = c.getSeller() != null ? c.getSeller().getId() : null;
        
        return ResponseEntity.ok(Map.of(
                "code", c.getCode(),
                "description", c.getDescription(),
                "discountPercentage", c.getDiscountPercentage(),
                "minimumOrderAmount", c.getMinimumOrderAmount(),
                "validUntil", c.getValidUntil().toString(),
                "sellerId", sellerId
        ));
    }

    /** Supplier creates a new coupon */
    @PostMapping("/seller")
    public ResponseEntity<?> createCoupon(@RequestBody CreateCouponRequest req) {
        if (req.getCode() == null || req.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Coupon code is required"));
        }
        String code = req.getCode().trim().toUpperCase();
        if (couponRepository.findByCode(code).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Coupon code already exists"));
        }

        Seller seller = null;
        if (req.getSellerId() != null) {
            seller = sellerRepository.findById(req.getSellerId()).orElse(null);
        }

        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime from = req.getValidFrom() != null ? LocalDateTime.parse(req.getValidFrom(), fmt) : LocalDateTime.now();
        LocalDateTime until = req.getValidUntil() != null ? LocalDateTime.parse(req.getValidUntil(), fmt) : LocalDateTime.now().plusMonths(3);

        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setDescription(req.getDescription() != null ? req.getDescription() : "");
        coupon.setDiscountPercentage(req.getDiscountPercentage());
        coupon.setMinimumOrderAmount(req.getMinimumOrderAmount());
        coupon.setMaxUsages(req.getMaxUsages() != null ? req.getMaxUsages() : 100);
        coupon.setCurrentUsageCount(0);
        coupon.setValidFrom(from);
        coupon.setValidUntil(until);
        coupon.setStatus("ACTIVE");
        coupon.setSeller(seller);

        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(saved);
    }

    /** Supplier lists their own coupons */
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Coupon>> getSellerCoupons(@PathVariable Long sellerId) {
        return ResponseEntity.ok(couponRepository.findBySellerId(sellerId));
    }

    /** Deactivate a coupon */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        c.setStatus("INACTIVE");
        couponRepository.save(c);
        return ResponseEntity.ok(Map.of("message", "Coupon deactivated"));
    }

    /** Delete a coupon */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted"));
    }
}
