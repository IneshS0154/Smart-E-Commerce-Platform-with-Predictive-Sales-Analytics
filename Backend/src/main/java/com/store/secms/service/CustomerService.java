package com.store.secms.service;

import com.store.secms.dto.*;
import com.store.secms.entity.Customer;
import com.store.secms.entity.CustomerLogin;
import com.store.secms.repository.CustomerLoginRepository;
import com.store.secms.repository.CustomerRepository;
import com.store.secms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerLoginRepository customerLoginRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public RegisterResponse registerCustomer(RegisterRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists. Please use a different email address.");
        }

        if (customerRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists. Please choose a different username.");
        }

        Customer customer = new Customer();
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setUsername(request.getUsername());
        customer.setEmail(request.getEmail());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAddress(request.getAddress());
        customer.setStatus("ACTIVE");
        customer.setRole("CUSTOMER");

        Customer savedCustomer = customerRepository.save(customer);

        CustomerLogin customerLogin = new CustomerLogin();
        customerLogin.setUsername(request.getUsername());
        customerLogin.setPassword(passwordEncoder.encode(request.getPassword()));
        customerLogin.setCustomer(savedCustomer);
        customerLoginRepository.save(customerLogin);

        RegisterResponse response = new RegisterResponse();
        response.setId(savedCustomer.getId());
        response.setFirstName(savedCustomer.getFirstName());
        response.setLastName(savedCustomer.getLastName());
        response.setUsername(savedCustomer.getUsername());
        response.setEmail(savedCustomer.getEmail());
        response.setStatus(savedCustomer.getStatus());
        response.setRole(savedCustomer.getRole());
        response.setMessage("Registration successful! Welcome to ANYWEAR.");
        return response;
    }

    public LoginResponse loginCustomer(LoginRequest request) {
        CustomerLogin customerLogin = customerLoginRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), customerLogin.getPassword())) {
            throw new RuntimeException("Invalid username or password.");
        }

        Customer customer = customerLogin.getCustomer();

        if ("DEACTIVATED".equals(customer.getStatus())) {
            throw new RuntimeException("Your account has been deactivated. Please contact support.");
        }

        String token = jwtUtil.generateToken(customer.getUsername(), customer.getRole(), customer.getId());

        LoginResponse response = new LoginResponse();
        response.setId(customer.getId());
        response.setFirstName(customer.getFirstName());
        response.setLastName(customer.getLastName());
        response.setUsername(customer.getUsername());
        response.setEmail(customer.getEmail());
        response.setPhoneNumber(customer.getPhoneNumber());
        response.setAddress(customer.getAddress());
        response.setStatus(customer.getStatus());
        response.setRole(customer.getRole());
        response.setToken(token);
        response.setExpiresIn(jwtUtil.getExpirationMs());

        return response;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll().stream()
                .filter(c -> "CUSTOMER".equals(c.getRole()))
                .collect(Collectors.toList());
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id)
                .filter(c -> "CUSTOMER".equals(c.getRole()));
    }

    public Optional<Customer> getCustomerByUsername(String username) {
        return customerRepository.findByUsername(username);
    }

    @Transactional
    public Customer updateCustomer(Long id, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found."));

        if (request.getFirstName() != null) {
            customer.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            customer.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            if (!customer.getEmail().equals(request.getEmail()) &&
                    customerRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already in use by another account.");
            }
            customer.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            customer.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }

        return customerRepository.save(customer);
    }

    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found."));

        CustomerLogin customerLogin = customerLoginRepository.findByCustomerId(id)
                .orElseThrow(() -> new RuntimeException("Customer login record not found."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), customerLogin.getPassword())) {
            throw new RuntimeException("Current password is incorrect.");
        }

        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        customerLogin.setPassword(encodedNewPassword);
        customerLoginRepository.save(customerLogin);

        customer.setPassword(encodedNewPassword);
        customerRepository.save(customer);
    }

    @Transactional
    public void deactivateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found."));
        customer.setStatus("DEACTIVATED");
        customerRepository.save(customer);
    }

    @Transactional
    public void activateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found."));
        customer.setStatus("ACTIVE");
        customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found."));
        customerLoginRepository.findByCustomerId(id).ifPresent(customerLoginRepository::delete);
        customerRepository.delete(customer);
    }
}
