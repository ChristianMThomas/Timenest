package com.example.Mind_Forge.response;

import com.example.Mind_Forge.model.Company;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyResponse {

    private String name;
    private String joinCode;

    public CompanyResponse(String name, String joinCode) {
        this.name = name;
        this.joinCode = joinCode;
    }

    // ✅ Add this constructor
    public CompanyResponse(Company company) {
        this.name = company.getName();
        this.joinCode = company.getJoinCode();
    }
}
