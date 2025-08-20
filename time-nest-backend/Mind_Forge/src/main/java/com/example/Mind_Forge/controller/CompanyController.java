package com.example.Mind_Forge.controller;

import com.example.Mind_Forge.dto.company.CreateCompanyDto;
import com.example.Mind_Forge.dto.company.JoinCompanyDto;
import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.response.CompanyResponse;
import com.example.Mind_Forge.service.CompanyService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    private final CompanyService companyService;
    private static final Logger log = LoggerFactory.getLogger(CompanyController.class);

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/create")
    public ResponseEntity<CompanyResponse> createCompany(@RequestBody CreateCompanyDto cCompanyDto) {
        log.info("Received request to create company: {}", cCompanyDto.getName()); // 👈 Add this
        Company createdCompany = companyService.createCompany(cCompanyDto);
        return ResponseEntity.ok(new CompanyResponse(createdCompany));
    }

    @PostMapping("/join")
    public ResponseEntity<CompanyResponse> joinCompany(@RequestBody JoinCompanyDto jCompanyDto) {
        Company joinedCompany = companyService.joinCompany(jCompanyDto.getJoinCode());
        return ResponseEntity.ok(new CompanyResponse(joinedCompany));
    }

    @GetMapping("/join")
    public ResponseEntity<String> testAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Principal: " + auth.getPrincipal());
        System.out.println("Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok("Access granted");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company company) {
        return ResponseEntity.ok(companyService.updateCompany(id, company));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
