package com.example.Mind_Forge.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "join_code", nullable = false, unique = true)
    private String joinCode;

    @Column(name = "executive_id", nullable = false)
    private Long executiveId;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // or @JsonManagedReference
    private List<User> users;

    // Default constructor
    public Company() {
    }

    // Constructor with fields
    public Company(String name, String joinCode) {
        this.name = name;
        this.joinCode = joinCode;
        this.createdAt = LocalDateTime.now();
    }

}
