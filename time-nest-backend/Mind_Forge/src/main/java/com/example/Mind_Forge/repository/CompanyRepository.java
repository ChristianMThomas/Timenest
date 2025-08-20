package com.example.Mind_Forge.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Mind_Forge.model.Company;


@Repository
public interface CompanyRepository  extends JpaRepository<Company, Long> {
    /*
     * - Spring sees findBy_() and auto-generates a query like
     * - SELECT * FROM users WHERE _ = ?
     */
    Optional<Company> findByName(String name);
    Optional<Company> findByJoinCode(String joinCode);
    boolean existsByJoinCode(String joinCode);
}
