package com.example.Mind_Forge.controller;

import com.example.Mind_Forge.dto.company.CreateCompanyDto;
import com.example.Mind_Forge.dto.company.JoinCompanyDto;
import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.response.CompanyResponse;
import com.example.Mind_Forge.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/create")
    public ResponseEntity<CompanyResponse> createCompany(@RequestBody CreateCompanyDto cCompanyDto) {
        Company createdCompany = companyService.createCompany(cCompanyDto);
        return ResponseEntity.ok(new CompanyResponse(createdCompany));
    }

    @PostMapping("/join")
    public ResponseEntity<CompanyResponse> joinCompany(@RequestBody JoinCompanyDto jCompanyDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // Or use principal if casting is safe

        Company joinedCompany = companyService.joinCompany(jCompanyDto.getJoinCode(), username);
        return ResponseEntity.ok(new CompanyResponse(joinedCompany));
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
