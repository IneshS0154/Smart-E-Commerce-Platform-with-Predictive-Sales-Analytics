package com.store.secms.controller;


import com.store.secms.dto.MessageResponse;
import com.store.secms.entity.Seller;
import com.store.secms.entity.SellerLogin;
import com.store.secms.entity.admin;
import com.store.secms.repository.SellerLoginRepository;
import com.store.secms.repository.SellerRepository;
import com.store.secms.repository.adminRepository;
import com.store.secms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class SellerController {

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SellerLoginRepository sellerLoginRepository;

    @Autowired
    private adminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

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
                return ResponseEntity.status(403).body(new MessageResponse("Your account is pending verification. Please wait until the admin approves your account."));
            }

            // Check if seller is rejected
            if ("REJECTED".equals(seller.getStatus())) {
                return ResponseEntity.status(403).body(new MessageResponse("Your account has been rejected by the admin"));
            }

            // Check if seller is deactivated
            if ("DEACTIVATED".equals(seller.getStatus())) {
                return ResponseEntity.status(403).body(new MessageResponse("Your account has been deactivated"));
            }

            Optional<SellerLogin> sellerLoginOpt = sellerLoginRepository.findBySeller(seller);
            if (sellerLoginOpt.isPresent() &&
                    passwordEncoder.matches(loginRequest.getPassword(), sellerLoginOpt.get().getPassword())) {
                seller.setUsername(sellerLoginOpt.get().getUsername());
                // Generate JWT token
                String token = jwtUtil.generateToken(seller.getEmail(), "SELLER", seller.getId());
                // Clear password before returning (security)
                seller.setPassword(null);
                // tag the response so the frontend knows the role
                Map<String, Object> body = new HashMap<>();
                body.put("role", "SELLER");
                body.put("token", token);
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
            String token = jwtUtil.generateToken(adminOpt.get().getUsername(), "ADMIN", adminOpt.get().getId());
            body.put("token", token);
            return ResponseEntity.ok(body);
        }

        return ResponseEntity.status(401).body(new MessageResponse("Invalid email or password"));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllSellers() {
        List<Seller> sellers = sellerRepository.findAll();
        for (Seller seller : sellers) {
            Optional<SellerLogin> loginOpt = sellerLoginRepository.findBySeller(seller);
            loginOpt.ifPresent(login -> seller.setUsername(login.getUsername()));
        }
        return ResponseEntity.ok(sellers);
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
            if (updatedSeller.getEmail() != null) {
                seller.setEmail(updatedSeller.getEmail());
            }
            
            if (updatedSeller.getUsername() != null || (updatedSeller.getPassword() != null && !updatedSeller.getPassword().trim().isEmpty())) {
                Optional<SellerLogin> loginOpt = sellerLoginRepository.findBySeller(seller);
                if (loginOpt.isPresent()) {
                    SellerLogin login = loginOpt.get();
                    if (updatedSeller.getUsername() != null) {
                        login.setUsername(updatedSeller.getUsername());
                    }
                    if (updatedSeller.getPassword() != null && !updatedSeller.getPassword().trim().isEmpty()) {
                        login.setPassword(passwordEncoder.encode(updatedSeller.getPassword()));
                    }
                    sellerLoginRepository.save(login);
                }
            }
            
            sellerRepository.save(seller);
            
            // Set the username back to the object to return updated values
            Optional<SellerLogin> loginOptReturn = sellerLoginRepository.findBySeller(seller);
            loginOptReturn.ifPresent(login -> seller.setUsername(login.getUsername()));
            
            return ResponseEntity.ok(seller);
        }
        return ResponseEntity.status(404).body("Seller not found");
    }
}