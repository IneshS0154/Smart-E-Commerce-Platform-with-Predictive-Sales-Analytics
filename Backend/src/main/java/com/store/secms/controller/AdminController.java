package com.store.secms.controller;


import com.store.secms.entity.admin;
import com.store.secms.repository.adminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin
public class AdminController {

    private final adminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody admin loginRequest) {

        Optional<admin> adminOpt = adminRepository.findByUsername(loginRequest.getUsername());

        if (adminOpt.isPresent()) {
            admin admin = adminOpt.get();

            if (passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                return ResponseEntity.ok(admin);
            }
        }

        return ResponseEntity.status(401).body("Invalid admin credentials");
    }
}
