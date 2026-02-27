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
    private String email;
    private String phoneNumber;
    private String address;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Transient
    private String username;

    @Transient
    private String password;
}