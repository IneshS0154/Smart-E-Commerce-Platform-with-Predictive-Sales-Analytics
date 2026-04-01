package com.store.secms.repository;

import com.store.secms.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductIdAndSize(Long cartId, Long productId, String size);

    void deleteByCartId(Long cartId);
}
