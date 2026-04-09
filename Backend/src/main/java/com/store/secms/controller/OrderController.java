package com.store.secms.controller;

import com.store.secms.dto.CheckoutRequest;
import com.store.secms.dto.MessageResponse;
import com.store.secms.entity.Customer;
import com.store.secms.entity.Order;
import com.store.secms.entity.OrderItem;
import com.store.secms.repository.CustomerRepository;
import com.store.secms.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CustomerRepository customerRepository;

    public OrderController(OrderService orderService, CustomerRepository customerRepository) {
        this.orderService = orderService;
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

    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(@RequestBody CheckoutRequest request) {
        Long customerId = getCurrentCustomerId();
        
        if (request.getCardNumber() == null || request.getCardNumber().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        if (request.getCardNumber().length() < 13 || request.getCardNumber().length() > 19) {
            throw new RuntimeException("Invalid card number");
        }
        
        if (request.getCvv() == null || request.getCvv().length() < 3 || request.getCvv().length() > 4) {
            throw new RuntimeException("Invalid CVV");
        }
        
        if (request.getExpiryDate() == null || request.getExpiryDate().isEmpty()) {
            throw new RuntimeException("Invalid expiry date");
        }
        
        String cardType = "UNKNOWN";
        String cardNumber = request.getCardNumber().replaceAll("\\s", "");
        if (cardNumber.startsWith("4")) {
            cardType = "VISA";
        } else if (cardNumber.startsWith("5") || cardNumber.startsWith("2")) {
            cardType = "MASTERCARD";
        } else if (cardNumber.startsWith("3")) {
            cardType = "AMEX";
        }
        
        if (request.getCardType() != null && !request.getCardType().isEmpty()) {
            cardType = request.getCardType().toUpperCase();
        }
        
        Order order = orderService.createOrder(
                customerId,
                request.getCouponCode(),
                request.getShippingAddress(),
                cardNumber,
                cardType,
                request.getExpiryDate(),
                request.getCvv()
        );
        
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        Long customerId = getCurrentCustomerId();
        List<Order> orders = orderService.getCustomerOrders(customerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable Long orderId) {
        List<OrderItem> items = orderService.getOrderItems(orderId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller/orders")
    public ResponseEntity<List<OrderItem>> getSellerOrders(@RequestParam Long sellerId) {
        List<OrderItem> items = orderService.getOrdersBySellerId(sellerId);
        return ResponseEntity.ok(items);
    }
}
