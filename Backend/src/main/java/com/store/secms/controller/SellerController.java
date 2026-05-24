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
import java.util.List;


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
        Seller existingSellerToUpdate = null;

        Optional<Seller> byEmail = sellerRepository.findByEmail(seller.getEmail());
        if (byEmail.isPresent()) {
            if (!"REJECTED".equals(byEmail.get().getStatus())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            existingSellerToUpdate = byEmail.get();
        }

        Optional<SellerLogin> byUsername = sellerLoginRepository.findByUsername(seller.getUsername());
        if (byUsername.isPresent()) {
            Seller linkedSeller = byUsername.get().getSeller();
            if (!"REJECTED".equals(linkedSeller.getStatus())) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            if (existingSellerToUpdate == null) {
                existingSellerToUpdate = linkedSeller;
            } else if (!existingSellerToUpdate.getId().equals(linkedSeller.getId())) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
        }

        Optional<Seller> byStoreName = sellerRepository.findByStoreName(seller.getStoreName());
        if (byStoreName.isPresent()) {
            Seller linkedSeller = byStoreName.get();
            if (!"REJECTED".equals(linkedSeller.getStatus())) {
                return ResponseEntity.badRequest().body("Brand name already exists");
            }
            if (existingSellerToUpdate == null) {
                existingSellerToUpdate = linkedSeller;
            } else if (!existingSellerToUpdate.getId().equals(linkedSeller.getId())) {
                return ResponseEntity.badRequest().body("Brand name already exists");
            }
        }

        if (existingSellerToUpdate != null) {
            existingSellerToUpdate.setStoreName(seller.getStoreName());
            existingSellerToUpdate.setEmail(seller.getEmail());
            existingSellerToUpdate.setPhoneNumber(seller.getPhoneNumber());
            existingSellerToUpdate.setAddress(seller.getAddress());
            existingSellerToUpdate.setStatus("PENDING");
            
            Seller savedSeller = sellerRepository.save(existingSellerToUpdate);
            
            Optional<SellerLogin> loginOpt = sellerLoginRepository.findBySeller(savedSeller);
            SellerLogin sellerLogin;
            if (loginOpt.isPresent()) {
                sellerLogin = loginOpt.get();
            } else {
                sellerLogin = new SellerLogin();
                sellerLogin.setSeller(savedSeller);
            }
            sellerLogin.setUsername(seller.getUsername());
            sellerLogin.setPassword(passwordEncoder.encode(seller.getPassword()));
            sellerLoginRepository.save(sellerLogin);
            
            savedSeller.setPassword(null);
            return ResponseEntity.ok(savedSeller);
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
            if (updatedSeller.getStoreName() != null && !updatedSeller.getStoreName().equals(seller.getStoreName())) {
                Optional<Seller> byStoreName = sellerRepository.findByStoreName(updatedSeller.getStoreName());
                if (byStoreName.isPresent()) {
                    return ResponseEntity.badRequest().body("Brand name already exists");
                }
                seller.setStoreName(updatedSeller.getStoreName());
            }
            if (updatedSeller.getPhoneNumber() != null) {
                seller.setPhoneNumber(updatedSeller.getPhoneNumber());
            }
            if (updatedSeller.getAddress() != null) {
                seller.setAddress(updatedSeller.getAddress());
            }
            if (updatedSeller.getEmail() != null && !updatedSeller.getEmail().equals(seller.getEmail())) {
                Optional<Seller> byEmail = sellerRepository.findByEmail(updatedSeller.getEmail());
                if (byEmail.isPresent()) {
                    return ResponseEntity.badRequest().body("Email already exists");
                }
                seller.setEmail(updatedSeller.getEmail());
            }
            
            // Handle username update in SellerLogin
            if (updatedSeller.getUsername() != null && !updatedSeller.getUsername().trim().isEmpty()) {
                Optional<SellerLogin> loginOpt = sellerLoginRepository.findBySeller(seller);
                if (loginOpt.isPresent()) {
                    SellerLogin login = loginOpt.get();
                    if (!updatedSeller.getUsername().equals(login.getUsername())) {
                        Optional<SellerLogin> byUsername = sellerLoginRepository.findByUsername(updatedSeller.getUsername());
                        if (byUsername.isPresent()) {
                            return ResponseEntity.badRequest().body("Username already exists");
                        }
                        login.setUsername(updatedSeller.getUsername());
                        sellerLoginRepository.save(login);
                    }
                    seller.setUsername(login.getUsername());
                }
            } else {
                // Populate existing username so it is returned
                Optional<SellerLogin> loginOpt = sellerLoginRepository.findBySeller(seller);
                loginOpt.ifPresent(login -> seller.setUsername(login.getUsername()));
            }

            sellerRepository.save(seller);
            return ResponseEntity.ok(seller);
        }
        return ResponseEntity.status(404).body("Seller not found");
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password cannot be empty");
        }
        
        Optional<Seller> sellerOpt = sellerRepository.findById(id);
        if (sellerOpt.isPresent()) {
            Optional<SellerLogin> loginOpt = sellerLoginRepository.findBySeller(sellerOpt.get());
            if (loginOpt.isPresent()) {
                SellerLogin login = loginOpt.get();
                login.setPassword(passwordEncoder.encode(newPassword));
                sellerLoginRepository.save(login);
                return ResponseEntity.ok("Password updated successfully");
            }
        }
        return ResponseEntity.status(404).body("Seller not found");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSeller(@PathVariable Long id) {
        Optional<Seller> sellerOpt = sellerRepository.findById(id);
        if (sellerOpt.isPresent()) {
            Seller seller = sellerOpt.get();
            // Delete associated SellerLogin first to avoid foreign key constraint violations
            Optional<SellerLogin> sellerLoginOpt = sellerLoginRepository.findBySeller(seller);
            sellerLoginOpt.ifPresent(sellerLogin -> sellerLoginRepository.delete(sellerLogin));
            
            sellerRepository.delete(seller);
            return ResponseEntity.ok("Seller deleted successfully");
        }
        return ResponseEntity.status(404).body("Seller not found");
    }
}