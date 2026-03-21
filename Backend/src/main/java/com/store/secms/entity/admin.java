package com.store.secms.entity;



import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "admins")
public class admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;
}