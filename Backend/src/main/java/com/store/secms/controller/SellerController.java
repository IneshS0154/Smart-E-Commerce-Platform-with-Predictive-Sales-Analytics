package com.store.secms.controller;



import com.store.secms.entity.Seller;
import com.store.secms.entity.SellerLogin;
import com.store.secms.entity.admin;
import com.store.secms.repository.SellerLoginRepository;
import com.store.secms.repository.SellerRepository;
import com.store.secms.repository.adminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
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

    @Autowired
    private adminRepository adminRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerSeller(@RequestBody Seller seller) {
        if (seller.getStatus() == null || seller.getStatus().trim().isEmpty()) {
            seller.setStatus("PENDING");
        }
        if (sellerRepository.findByEmail(seller.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        Seller savedSeller = sellerRepository.save(seller);

        SellerLogin sellerLogin = new SellerLogin();
        sellerLogin.setUsername(seller.getUsername());
        sellerLogin.setPassword(passwordEncoder.encode(seller.getPassword()));
        sellerLogin.setSeller(savedSeller);
        sellerLoginRepository.save(sellerLogin);

        // Avoid echoing transient password back to clients
        savedSeller.setPassword(null);
        return ResponseEntity.ok(savedSeller);
    }



    @PostMapping("/login")
    public ResponseEntity<?> loginSeller(@RequestBody Seller loginRequest) {

        // ── 1. Try seller login ──────────────────────────────────────────
        Optional<Seller> sellerOpt = sellerRepository.findByEmail(loginRequest.getEmail());
        if (sellerOpt.isPresent()) {
            Seller seller = sellerOpt.get();

            // Check if seller is pending
            if ("PENDING".equals(seller.getStatus())) {
                return ResponseEntity.status(403).body("Your account is pending verification. Please wait until the admin approves your account with these credentials.");
            }

            // Check if seller is rejected
            if ("REJECTED".equals(seller.getStatus())) {
                return ResponseEntity.status(403).body("Your account has been rejected by the admin");
            }

            // Check if seller is deactivated
            if ("DEACTIVATED".equals(seller.getStatus())) {
                return ResponseEntity.status(403).body("Your account has been deactivated");
            }

            Optional<SellerLogin> sellerLoginOpt = sellerLoginRepository.findBySeller(seller);
            if (sellerLoginOpt.isPresent() &&
                    passwordEncoder.matches(loginRequest.getPassword(), sellerLoginOpt.get().getPassword())) {
                seller.setUsername(sellerLoginOpt.get().getUsername());
                // tag the response so the frontend knows the role
                Map<String, Object> body = new HashMap<>();
                body.put("role", "SELLER");
                body.put("data", seller);
                return ResponseEntity.ok(body);
            }
        }

        // ── 2. Try admin login (username stored in the email field) ──────
        Optional<admin> adminOpt = adminRepository.findByUsername(loginRequest.getEmail());
        if (adminOpt.isPresent() &&
                passwordEncoder.matches(loginRequest.getPassword(), adminOpt.get().getPassword())) {
            Map<String, Object> body = new HashMap<>();
            body.put("role", "ADMIN");
            body.put("id",   adminOpt.get().getId());
            body.put("username", adminOpt.get().getUsername());
            return ResponseEntity.ok(body);
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllSellers() {
        return ResponseEntity.ok(sellerRepository.findAll());
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateSeller(@PathVariable Long id) {
        Optional<Seller> sellerOpt = sellerRepository.findById(id);
        if (sellerOpt.isPresent()) {
            Seller seller = sellerOpt.get();
            seller.setStatus("DEACTIVATED");
            sellerRepository.save(seller);
            return ResponseEntity.ok("Seller deactivated successfully");
        }
        return ResponseEntity.status(404).body("Seller not found");
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateSeller(@PathVariable Long id) {
        Optional<Seller> sellerOpt = sellerRepository.findById(id);
        if (sellerOpt.isPresent()) {
            Seller seller = sellerOpt.get();
            seller.setStatus("ACTIVE");
            sellerRepository.save(seller);
            return ResponseEntity.ok("Seller activated successfully");
        }
        return ResponseEntity.status(404).body("Seller not found");
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveSeller(@PathVariable Long id) {
        Optional<Seller> sellerOpt = sellerRepository.findById(id);
        if (sellerOpt.isPresent()) {
            Seller seller = sellerOpt.get();
            if ("PENDING".equals(seller.getStatus())) {
                seller.setStatus("ACTIVE");
                sellerRepository.save(seller);
                return ResponseEntity.ok("Seller approved successfully");
            }
            return ResponseEntity.badRequest().body("Seller is not in pending status");
        }
        return ResponseEntity.status(404).body("Seller not found");
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectSeller(@PathVariable Long id) {
        Optional<Seller> sellerOpt = sellerRepository.findById(id);
        if (sellerOpt.isPresent()) {
            Seller seller = sellerOpt.get();
            if ("PENDING".equals(seller.getStatus())) {
                seller.setStatus("REJECTED");
                sellerRepository.save(seller);
                return ResponseEntity.ok("Seller rejected successfully");
            }
            return ResponseEntity.badRequest().body("Seller is not in pending status");
        }
        return ResponseEntity.status(404).body("Seller not found");
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateSeller(@PathVariable Long id, @RequestBody Seller updatedSeller) {
        Optional<Seller> sellerOpt = sellerRepository.findById(id);
        if (sellerOpt.isPresent()) {
            Seller seller = sellerOpt.get();
            if (updatedSeller.getStoreName() != null) {
                seller.setStoreName(updatedSeller.getStoreName());
            }
            if (updatedSeller.getPhoneNumber() != null) {
                seller.setPhoneNumber(updatedSeller.getPhoneNumber());
            }
            if (updatedSeller.getAddress() != null) {
                seller.setAddress(updatedSeller.getAddress());
            }
            sellerRepository.save(seller);
            return ResponseEntity.ok(seller);
        }
        return ResponseEntity.status(404).body("Seller not found");
    }
}