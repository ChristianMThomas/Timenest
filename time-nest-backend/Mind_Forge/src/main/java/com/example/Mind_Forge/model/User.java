package com.example.Mind_Forge.model;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {
    private static final Logger log = LoggerFactory.getLogger(User.class);
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "role")
    private String role; // e.g., "employee", "executive"

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_expiration")
    private LocalDateTime verificationCodeExpiresAt;

    private boolean enabled;

    @ManyToOne
    @JoinColumn(name = "company_id")
    @JsonIgnore // or @JsonManagedReference
    private Company company;

    public User() {
    }

    public User(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // ✅ Map domain role to Spring Security authority
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        log.info("User role from DB: {}", role);

        if (role == null || role.isBlank()) {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }

        String springRole = switch (role.toLowerCase()) {
            case "executive" -> "ROLE_EXECUTIVE";
            case "employee" -> "ROLE_EMPLOYEE";
            default -> "ROLE_USER";
        };

        return List.of(new SimpleGrantedAuthority(springRole));
    }

    public String getActualUsername(){
        return this.username;  // RETURN ACTUAL USERNAME (BAND-AID SO WE DONT MESS UP JWT)
    }
    
    @Override
    public String getUsername() {
        return this.email; // JWT subject = email
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
