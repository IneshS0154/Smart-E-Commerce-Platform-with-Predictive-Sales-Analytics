package com.store.secms.controller;

import com.store.secms.dto.MessageResponse;
import com.store.secms.entity.Customer;
import com.store.secms.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CUSTOMER') and #id == authentication.principal.userId)")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Customer> getCurrentCustomer(@RequestParam String username) {
        return customerService.getCustomerByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> updateCurrentCustomer(@RequestBody com.store.secms.dto.CustomerUpdateRequest request) {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            com.store.secms.security.UserPrincipal principal = (com.store.secms.security.UserPrincipal) auth.getPrincipal();
            Customer updated = customerService.updateCustomer(principal.getUserId(), request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/me/change-password")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> changeCurrentPassword(@RequestBody com.store.secms.dto.ChangePasswordRequest request) {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            com.store.secms.security.UserPrincipal principal = (com.store.secms.security.UserPrincipal) auth.getPrincipal();
            customerService.changePassword(principal.getUserId(), request);
            return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/update")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CUSTOMER') and #id == principal.userId)")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id,
            @RequestBody com.store.secms.dto.CustomerUpdateRequest request) {
        try {
            Customer updated = customerService.updateCustomer(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/change-password")
    @PreAuthorize("hasRole('CUSTOMER') and #id == principal.userId")
    public ResponseEntity<?> changePassword(@PathVariable Long id,
            @RequestBody com.store.secms.dto.ChangePasswordRequest request) {
        try {
            customerService.changePassword(id, request);
            return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateCustomer(@PathVariable Long id) {
        try {
            customerService.deactivateCustomer(id);
            return ResponseEntity.ok(new MessageResponse("Customer deactivated successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateCustomer(@PathVariable Long id) {
        try {
            customerService.activateCustomer(id);
            return ResponseEntity.ok(new MessageResponse("Customer activated successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.ok(new MessageResponse("Customer deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }
}
