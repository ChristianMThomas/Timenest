package com.example.Mind_Forge.response;

import com.example.Mind_Forge.model.Company;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CompanyResponse {

    private Long id;
    private String name;
    private String joinCode;
    private LocalDateTime createdAt;

    public CompanyResponse(String name, String joinCode) {
        this.name = name;
        this.joinCode = joinCode;
    }


    public CompanyResponse(Company company) {
        this.id = company.getId();
        this.name = company.getName();
        this.joinCode = company.getJoinCode();
        this.createdAt = company.getCreatedAt();
    }
}
