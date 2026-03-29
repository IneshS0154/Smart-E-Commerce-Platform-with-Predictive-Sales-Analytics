package com.store.secms.repository;

import com.store.secms.entity.CustomerLogin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerLoginRepository extends JpaRepository<CustomerLogin, Long> {

    Optional<CustomerLogin> findByUsername(String username);

    Optional<CustomerLogin> findByCustomerId(Long customerId);

    boolean existsByUsername(String username);
}
