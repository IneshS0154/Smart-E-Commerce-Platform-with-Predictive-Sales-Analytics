package com.store.secms.service;

import com.store.secms.entity.*;
import com.store.secms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                        ProductRepository productRepository, CustomerRepository customerRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    public Cart getCartByCustomerId(Long customerId) {
        Optional<Cart> cart = cartRepository.findByCustomerIdWithItemsAndProducts(customerId);
        if (cart.isPresent()) {
            return cart.get();
        }
        
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        Cart newCart = new Cart();
        newCart.setCustomer(customer);
        newCart.setCartItems(new ArrayList<>());
        return cartRepository.save(newCart);
    }

    @Transactional
    public Cart addToCart(Long customerId, Long productId, String size, Integer quantity) {
        Cart cart = getCartByCustomerId(customerId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
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
        
        if (stock.getStockCount() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + stock.getStockCount());
        }
        
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductIdAndSize(
                cart.getId(), productId, size);
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (stock.getStockCount() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + stock.getStockCount());
            }
            item.setQuantity(newQuantity);
            item.setPrice(stock.getPrice());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setSize(size);
            newItem.setQuantity(quantity);
            newItem.setPrice(stock.getPrice());
            cart.getCartItems().add(newItem);
            cartItemRepository.save(newItem);
        }
        
        cartRepository.save(cart);
        // Return fresh cart with eager loaded details
        return cartRepository.findByCustomerIdWithItemsAndProducts(customerId)
                .orElse(cart);
    }

    @Transactional
    public Cart updateCartItemQuantity(Long customerId, Long cartItemId, Integer quantity) {
        Cart cart = getCartByCustomerId(customerId);
        
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }
        
        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            ProductStock.SizeEnum sizeEnum;
            try {
                sizeEnum = ProductStock.SizeEnum.valueOf(item.getSize().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid size: " + item.getSize());
            }
            
            ProductStock stock = item.getProduct().getStocks().stream()
                    .filter(s -> s.getSize() == sizeEnum)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Stock not found"));
            
            if (stock.getStockCount() < quantity) {
                throw new RuntimeException("Insufficient stock. Available: " + stock.getStockCount());
            }
            
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        
        cartRepository.save(cart);
        // Return fresh cart with eager loaded details
        return cartRepository.findByCustomerIdWithItemsAndProducts(customerId)
                .orElse(cart);
    }

    @Transactional
    public Cart updateCartItemSize(Long customerId, Long cartItemId, String newSize) {
        Cart cart = getCartByCustomerId(customerId);
        
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }
        
        Product product = item.getProduct();
        
        // Validate new size
        ProductStock.SizeEnum sizeEnum;
        try {
            sizeEnum = ProductStock.SizeEnum.valueOf(newSize.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid size: " + newSize);
        }
        
        // Check if stock exists for new size
        ProductStock newStock = product.getStocks().stream()
                .filter(s -> s.getSize() == sizeEnum)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Stock not found for size: " + newSize));
        
        // Check if sufficient stock for new size
        if (newStock.getStockCount() < item.getQuantity()) {
            throw new RuntimeException("Insufficient stock for size " + newSize + ". Available: " + newStock.getStockCount());
        }
        
        // Check if same product with new size already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductIdAndSize(
                cart.getId(), product.getId(), newSize);
        
        if (existingItem.isPresent() && !existingItem.get().getId().equals(cartItemId)) {
            // Merge quantities
            CartItem existing = existingItem.get();
            int newQuantity = existing.getQuantity() + item.getQuantity();
            if (newStock.getStockCount() < newQuantity) {
                throw new RuntimeException("Insufficient stock for size " + newSize + ". Available: " + newStock.getStockCount());
            }
            existing.setQuantity(newQuantity);
            existing.setPrice(newStock.getPrice());
            cartItemRepository.save(existing);
            cartItemRepository.delete(item);
            cart.getCartItems().remove(item);
        } else {
            // Update size and price
            item.setSize(newSize);
            item.setPrice(newStock.getPrice());
            cartItemRepository.save(item);
        }
        
        cartRepository.save(cart);
        // Return fresh cart with eager loaded details
        return cartRepository.findByCustomerIdWithItemsAndProducts(customerId)
                .orElse(cart);
    }

    @Transactional
    public Cart removeCartItem(Long customerId, Long cartItemId) {
        Cart cart = getCartByCustomerId(customerId);
        
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }
        
        cartItemRepository.delete(item);
        cart.getCartItems().remove(item);
        
        cartRepository.save(cart);
        // Return fresh cart with eager loaded details
        return cartRepository.findByCustomerIdWithItemsAndProducts(customerId)
                .orElse(cart);
    }

    @Transactional
    public void clearCart(Long customerId) {
        Cart cart = getCartByCustomerId(customerId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }

    public int getCartItemCount(Long customerId) {
        Cart cart = getCartByCustomerId(customerId);
        return cart.getCartItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    public BigDecimal getCartTotal(Long customerId) {
        Cart cart = getCartByCustomerId(customerId);
        return cart.getCartItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
