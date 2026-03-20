package com.store.secms.config;


import com.store.secms.entity.admin;
import com.store.secms.repository.adminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Dataseeder implements CommandLineRunner {

    private final adminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (adminRepository.count() == 0) {
            admin admin = new admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            adminRepository.save(admin);
            System.out.println("admin created → username: admin | password: admin123");
        }
    }
}
