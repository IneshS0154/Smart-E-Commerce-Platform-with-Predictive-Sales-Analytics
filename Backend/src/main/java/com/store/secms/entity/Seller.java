package com.store.secms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
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
    private String status = "PENDING";

    @Transient
    private String username;

    @Transient
    private String password;
}
