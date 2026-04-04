package com.store.secms.repository;

import com.store.secms.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.product p LEFT JOIN FETCH p.seller LEFT JOIN FETCH oi.order o LEFT JOIN FETCH o.customer WHERE p.seller.id = :sellerId ORDER BY o.createdAt DESC")
    List<OrderItem> findByProductSellerIdWithDetails(@Param("sellerId") Long sellerId);

    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.product p LEFT JOIN FETCH p.seller LEFT JOIN FETCH oi.order o WHERE o.customer.id = :customerId AND o.createdAt >= :date ORDER BY o.createdAt DESC")
    List<OrderItem> findByCustomerIdAndOrderDateAfter(@Param("customerId") Long customerId, @Param("date") LocalDateTime date);
}
