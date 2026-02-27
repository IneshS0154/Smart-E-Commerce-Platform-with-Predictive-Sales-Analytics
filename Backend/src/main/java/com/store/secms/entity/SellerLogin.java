package com.store.secms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "seller_login")
public class SellerLogin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @OneToOne
    @JoinColumn(name = "seller_id", nullable = false, unique = true)
    private Seller seller;
}

