package com.store.secms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "sellers")
public class Seller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String storeName;
    private String username;
    private String email;
    private String phoneNumber;
    private String address;
    private String password; // Note: For production, this must be hashed (e.g., BCrypt)
}