package com.SmartCommerce.config;

import com.SmartCommerce.entity.User;
import com.SmartCommerce.entity.UserRole;
import com.SmartCommerce.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initializeDefaultUsers();
    }

    private void initializeDefaultUsers() {
        createUserIfNotExists("admin123", "admin@anywear.ai", "admin123", "Admin", "User", UserRole.ADMIN);
        createUserIfNotExists("customer123", "customer@anywear.ai", "customer123", "John", "Customer", UserRole.CUSTOMER);
        createUserIfNotExists("supplier123", "supplier@anywear.ai", "supplier123", "Mike", "Supplier", UserRole.SUPPLIER);
    }

    private void createUserIfNotExists(String username, String email, String password, String firstName, String lastName, UserRole role) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isEmpty()) {
            User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .isActive(true)
                .build();
            userRepository.save(user);
            System.out.println("Created default user: " + username + " with role: " + role);
        }
    }
}
