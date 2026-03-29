package com.store.secms.repository;

import com.store.secms.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
