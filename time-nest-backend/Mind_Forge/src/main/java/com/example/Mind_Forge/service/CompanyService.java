package com.example.Mind_Forge.service;

import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;


    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
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

    /*  For security reasons we are not using this method in the future we can use for admins
       public List<Company> getAllCompanies() {
        return null;
    }
    */

    // ✅ Create a new company
    public Company createCompany(Company company) {
        return companyRepository.save(company);
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
