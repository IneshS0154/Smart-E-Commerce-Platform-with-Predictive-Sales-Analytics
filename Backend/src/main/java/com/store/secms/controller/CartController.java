package com.store.secms.controller;

import com.store.secms.dto.AddToCartRequest;
import com.store.secms.dto.MessageResponse;
import com.store.secms.entity.Cart;
import com.store.secms.entity.Customer;
import com.store.secms.repository.CustomerRepository;
import com.store.secms.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final CustomerRepository customerRepository;

    public CartController(CartService cartService, CustomerRepository customerRepository) {
        this.cartService = cartService;
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

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        Long customerId = getCurrentCustomerId();
        Cart cart = cartService.getCartByCustomerId(customerId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestBody AddToCartRequest request) {
        Long customerId = getCurrentCustomerId();
        Cart cart = cartService.addToCart(customerId, request.getProductId(), 
                                          request.getSize(), request.getQuantity());
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<Cart> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        Long customerId = getCurrentCustomerId();
        Cart cart = cartService.updateCartItemQuantity(customerId, cartItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update-size/{cartItemId}")
    public ResponseEntity<Cart> updateCartItemSize(
            @PathVariable Long cartItemId,
            @RequestParam String size) {
        Long customerId = getCurrentCustomerId();
        Cart cart = cartService.updateCartItemSize(customerId, cartItemId, size);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Cart> removeCartItem(@PathVariable Long cartItemId) {
        Long customerId = getCurrentCustomerId();
        Cart cart = cartService.removeCartItem(customerId, cartItemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<MessageResponse> clearCart() {
        Long customerId = getCurrentCustomerId();
        cartService.clearCart(customerId);
        return ResponseEntity.ok(new MessageResponse("Cart cleared successfully"));
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartCount() {
        Long customerId = getCurrentCustomerId();
        int count = cartService.getCartItemCount(customerId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getCartTotal() {
        Long customerId = getCurrentCustomerId();
        BigDecimal total = cartService.getCartTotal(customerId);
        return ResponseEntity.ok(total);
    }
}
