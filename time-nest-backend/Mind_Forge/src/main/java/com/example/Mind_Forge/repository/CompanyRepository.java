package com.example.Mind_Forge.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.User;

@Repository
public interface CompanyRepository  extends CrudRepository<User, Long> {

    /*
     * - Spring sees findBy_() and auto-generates a query like
     * - SELECT * FROM users WHERE _ = ?
     */

    Optional<Company> findByName(String name);
    Optional<Company> findByJoinCode(Long joinCode);
    boolean existsByJoinCode(String joinCode);
}
