package com.store.secms.controller;



import com.store.secms.entity.Seller;
import com.store.secms.entity.SellerLogin;
import com.store.secms.repository.SellerLoginRepository;
import com.store.secms.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = "http://localhost:5173") // Default Vite port
public class SellerController {

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SellerLoginRepository sellerLoginRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerSeller(@RequestBody Seller seller) {
        if (sellerRepository.findByEmail(seller.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        Seller savedSeller = sellerRepository.save(seller);

        SellerLogin sellerLogin = new SellerLogin();
        sellerLogin.setUsername(seller.getUsername());
        sellerLogin.setPassword(passwordEncoder.encode(seller.getPassword()));
        sellerLogin.setSeller(savedSeller);
        sellerLoginRepository.save(sellerLogin);

        return ResponseEntity.ok(savedSeller);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginSeller(@RequestBody Seller loginRequest) {
        Optional<Seller> sellerOpt = sellerRepository.findByEmail(loginRequest.getEmail());

        if (sellerOpt.isPresent()) {
            Seller seller = sellerOpt.get();
            Optional<SellerLogin> sellerLoginOpt = sellerLoginRepository.findBySeller(seller);
            if (sellerLoginOpt.isPresent()) {
                SellerLogin sellerLogin = sellerLoginOpt.get();
                if (passwordEncoder.matches(loginRequest.getPassword(), sellerLogin.getPassword())) {
                    seller.setUsername(sellerLogin.getUsername());
                    return ResponseEntity.ok(seller);
                }
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}