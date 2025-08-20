package com.example.Mind_Forge.service;

import com.example.Mind_Forge.dto.company.CreateCompanyDto;
import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.repository.CompanyRepository;
import com.example.Mind_Forge.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    private static final Logger log = LoggerFactory.getLogger(CompanyService.class);

    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    // 🔍 Find company by name
    public Optional<Company> findByName(String name) {
        return companyRepository.findByName(name);
    }

    // 🔍 Find company by join code
    public Optional<Company> findByJoinCode(String joinCode) {
        return companyRepository.findByJoinCode(joinCode);
    }

    // Check if join code exists
    public boolean joinCodeExists(String joinCode) {
        return companyRepository.existsByJoinCode(joinCode);
    }

    /*
     * For security reasons we are not using this method in the future we can use
     * for admins
     * public List<Company> getAllCompanies() {
     * return null;
     * }
     */

    // Create a new company
    @Transactional
    public Company createCompany(CreateCompanyDto input) {

        // Extract authenticated user
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString(); // fallback
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Create and assign executive
        Company company = new Company(input.getName(), input.getJoinCode());
        company.setExecutiveId(user.getId());
        Company savedCompany = companyRepository.save(company);
        log.info("Saved company ID: {}", savedCompany.getId());
        user.setRole("executive");
        user.setCompany(savedCompany); // if you want reverse lookup
        userRepository.saveAndFlush(user);

        return savedCompany;
    }

    // Join a existing company
    @Transactional
    public Company joinCompany(String joinCode) {

        // Get authenticated user
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : principal.toString();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        if (user.getCompany() != null) {
            throw new IllegalStateException("User already belongs to a company");
        }

        Company company = companyRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid join code"));

        user.setCompany(company);
        user.setRole("employee");

        userRepository.save(user);
        log.info("User {} joined company {}", user.getEmail(), company.getName());

        return company;
    }

    // ✅ Get company by ID
    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Company not found with ID: " + id));
    }

    // ✅ Update company
    public Company updateCompany(Long id, Company updatedCompany) {
        Company existing = getCompanyById(id);
        existing.setName(updatedCompany.getName());
        existing.setJoinCode(updatedCompany.getJoinCode());
        // Add other fields as needed
        return companyRepository.save(existing);
    }

    // ✅ Delete company
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new NoSuchElementException("Company not found with ID: " + id);
        }
        companyRepository.deleteById(id);
    }

}
