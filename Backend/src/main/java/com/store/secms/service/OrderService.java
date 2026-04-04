package com.store.secms.service;

import com.store.secms.entity.*;
import com.store.secms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                         CartRepository cartRepository, CartItemRepository cartItemRepository,
                         CouponRepository couponRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.couponRepository = couponRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(Long customerId, String couponCode, String shippingAddress,
                             String cardNumber, String cardType, String expiryDate, String cvv) {
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        
        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        Customer customer = cart.getCustomer();
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItems()) {
            BigDecimal itemTotal = cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        
        Coupon coupon = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        if (couponCode != null && !couponCode.isEmpty()) {
            coupon = couponRepository.findByCodeAndStatus(couponCode.toUpperCase(), "ACTIVE")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired coupon"));
            
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
                throw new RuntimeException("Coupon is not valid at this time");
            }
            
            BigDecimal eligibleSubtotal = BigDecimal.ZERO;
            if (coupon.getSeller() != null) {
                Long sellerId = coupon.getSeller().getId();
                for (CartItem cartItem : cart.getCartItems()) {
                    if (cartItem.getProduct().getSeller().getId().equals(sellerId)) {
                        BigDecimal itemTotal = cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
                        eligibleSubtotal = eligibleSubtotal.add(itemTotal);
                    }
                }
            } else {
                eligibleSubtotal = totalAmount;
            }

            if (eligibleSubtotal.compareTo(BigDecimal.ZERO) == 0) {
                throw new RuntimeException("No eligible items in cart for this coupon");
            }
            
            if (eligibleSubtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
                throw new RuntimeException("Minimum order amount not met for this coupon");
            }
            
            if (coupon.getMaxUsages() != null && coupon.getCurrentUsageCount() >= coupon.getMaxUsages()) {
                throw new RuntimeException("Coupon usage limit exceeded");
            }
            
            discountAmount = eligibleSubtotal.multiply(coupon.getDiscountPercentage())
                    .divide(BigDecimal.valueOf(100));
            
            coupon.setCurrentUsageCount(coupon.getCurrentUsageCount() + 1);
            couponRepository.save(coupon);
        }
        
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        
        String cardLastFour = cardNumber != null && cardNumber.length() >= 4 
                ? cardNumber.substring(cardNumber.length() - 4) 
                : "****";
        
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        Order order = new Order();
        order.setTransactionId(transactionId);
        order.setCustomer(customer);
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(finalAmount);
        order.setCoupon(coupon);
        order.setPaymentMethod("CARD");
        order.setPaymentStatus("COMPLETED");
        order.setOrderStatus("PROCESSING");
        order.setShippingAddress(shippingAddress);
        order.setCardLastFour(cardLastFour);
        order.setCardType(cardType);
        
        order = orderRepository.save(order);
        
        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setSize(cartItem.getSize());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setSubtotal(cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            
            orderItemRepository.save(orderItem);
            
            reduceStock(cartItem.getProduct(), cartItem.getSize(), cartItem.getQuantity());
        }
        
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();
        cartRepository.save(cart);
        
        return order;
    }

    private void reduceStock(Product product, String size, Integer quantity) {
        ProductStock.SizeEnum sizeEnum;
        try {
            sizeEnum = ProductStock.SizeEnum.valueOf(size.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid size: " + size);
        }
        
        ProductStock stock = product.getStocks().stream()
                .filter(s -> s.getSize() == sizeEnum)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Stock not found for size: " + size));
        
        int newStockCount = stock.getStockCount() - quantity;
        if (newStockCount < 0) {
            throw new RuntimeException("Insufficient stock for size: " + size);
        }
        
        stock.setStockCount(newStockCount);
        productRepository.save(product);
    }

    public List<Order> getCustomerOrders(Long customerId) {
        return orderRepository.findByCustomerIdWithDetails(customerId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllWithDetails();
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    public List<OrderItem> getOrdersBySellerId(Long sellerId) {
        return orderItemRepository.findByProductSellerIdWithDetails(sellerId);
    }
}
