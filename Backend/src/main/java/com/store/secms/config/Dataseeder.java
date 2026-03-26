package com.store.secms.config;

import com.store.secms.entity.Customer;
import com.store.secms.entity.CustomerLogin;
import com.store.secms.entity.admin;
import com.store.secms.repository.CustomerLoginRepository;
import com.store.secms.repository.CustomerRepository;
import com.store.secms.repository.adminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class Dataseeder implements CommandLineRunner {

    private final adminRepository adminRepository;
    private final CustomerRepository customerRepository;
    private final CustomerLoginRepository customerLoginRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminRepository.count() == 0) {
            admin admin = new admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            adminRepository.save(admin);
            System.out.println("Admin created -> username: admin | password: admin123");
        }

        if (customerRepository.count() == 0) {
            Customer customer = new Customer();
            customer.setFirstName("John");
            customer.setLastName("Doe");
            customer.setUsername("customer");
            customer.setEmail("customer@anywear.com");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setPhoneNumber("+94 77 123 4567");
            customer.setAddress("123 Main Street");
            customer.setStatus("ACTIVE");
            customer.setRole("CUSTOMER");
            customer.setCreatedAt(LocalDateTime.now());
            Customer savedCustomer = customerRepository.save(customer);

            CustomerLogin customerLogin = new CustomerLogin();
            customerLogin.setUsername("customer");
            customerLogin.setPassword(passwordEncoder.encode("customer123"));
            customerLogin.setCustomer(savedCustomer);
            customerLoginRepository.save(customerLogin);

            System.out.println("Demo customer created -> username: customer | password: customer123");
        }
    }
}
