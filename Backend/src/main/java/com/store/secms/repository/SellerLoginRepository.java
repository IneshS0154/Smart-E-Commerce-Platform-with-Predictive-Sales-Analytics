package com.store.secms.repository;

import com.store.secms.entity.Seller;
import com.store.secms.entity.SellerLogin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerLoginRepository extends JpaRepository<SellerLogin, Long> {
    Optional<SellerLogin> findByUsername(String username);
    Optional<SellerLogin> findBySeller(Seller seller);
}

