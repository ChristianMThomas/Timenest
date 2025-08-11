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
    public Optional<Company> findByJoinCode(Long joinCode) {
        return companyRepository.findByJoinCode(joinCode);
    }

    // Check if join code exists
    public boolean joinCodeExists(String joinCode) {
        return companyRepository.existsByJoinCode(joinCode);
    }
}
