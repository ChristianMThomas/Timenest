package com.example.Mind_Forge.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.example.Mind_Forge.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /*
     * - Spring sees findBy_() and auto-generates a query like
     * - SELECT * FROM users WHERE _ = ?
     * 
     */
    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationCode(String verificationCode);

    Optional<User> findByUsername(String username);
}
