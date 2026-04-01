package com.store.secms.repository;

import com.store.secms.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByCustomerId(Long customerId);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems ci LEFT JOIN FETCH ci.product p LEFT JOIN FETCH p.seller WHERE c.customer.id = :customerId")
    Optional<Cart> findByCustomerIdWithItemsAndProducts(@Param("customerId") Long customerId);
}
