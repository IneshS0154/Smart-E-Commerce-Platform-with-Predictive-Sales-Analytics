package com.store.secms.controller;

import com.store.secms.entity.admin;
import com.store.secms.repository.adminRepository;
import com.store.secms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AdminAuthController {

    @Autowired
    private adminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }

        admin adminEntity = adminRepository.findByUsername(username).orElse(null);

        if (adminEntity == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
        }

        if (!passwordEncoder.matches(password, adminEntity.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
        }

        String token = jwtUtil.generateToken(adminEntity.getUsername(), "ADMIN", adminEntity.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("role", "ADMIN");
        response.put("id", adminEntity.getId());
        response.put("username", adminEntity.getUsername());
        response.put("token", token);
        response.put("message", "Login successful");

        return ResponseEntity.ok(response);
    }
}
