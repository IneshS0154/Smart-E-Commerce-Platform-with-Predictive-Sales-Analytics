package com.store.secms.repository;

import com.store.secms.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.customer c LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product p LEFT JOIN FETCH p.seller WHERE o.customer.id = :customerId ORDER BY o.createdAt DESC")
    List<Order> findByCustomerIdWithDetails(@Param("customerId") Long customerId);

    Optional<Order> findByTransactionId(String transactionId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.customer c LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product p LEFT JOIN FETCH p.seller ORDER BY o.createdAt DESC")
    List<Order> findAllWithDetails();
}
