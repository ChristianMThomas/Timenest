package com.example.Mind_Forge.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.WorkArea;

@Repository
public interface WorkAreaRepository extends JpaRepository<WorkArea, Long> {
    /*
     * Find all work areas for a specific company
     */
    List<WorkArea> findByCompany(Company company);

    /*
     * Find only active work areas for a specific company
     */
    List<WorkArea> findByCompanyAndActiveTrue(Company company);

    /*
     * Find a specific work area by ID and company (for security - ensure user can only access their company's areas)
     */
    Optional<WorkArea> findByIdAndCompany(Long id, Company company);

    /*
     * Check if a work area exists by ID and company
     */
    boolean existsByIdAndCompany(Long id, Company company);
}
