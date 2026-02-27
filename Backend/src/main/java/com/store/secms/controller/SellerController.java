package com.store.secms.controller;



import com.store.secms.entity.Seller;
import com.store.secms.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = "http://localhost:5173") // Default Vite port
public class SellerController {

    @Autowired
    private SellerRepository sellerRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerSeller(@RequestBody Seller seller) {
        if (sellerRepository.findByEmail(seller.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        // In a real app, hash the password here before saving
        Seller savedSeller = sellerRepository.save(seller);
        return ResponseEntity.ok(savedSeller);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginSeller(@RequestBody Seller loginRequest) {
        Optional<Seller> sellerOpt = sellerRepository.findByEmail(loginRequest.getEmail());

        if (sellerOpt.isPresent() && sellerOpt.get().getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.ok(sellerOpt.get());
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}