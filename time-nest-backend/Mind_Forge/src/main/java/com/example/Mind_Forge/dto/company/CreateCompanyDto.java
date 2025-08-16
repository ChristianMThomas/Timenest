package com.example.Mind_Forge.dto.company;

import com.example.Mind_Forge.model.Company;
import lombok.Getter;

@Getter
public class CreateCompanyDto {
    private String name;
    private String joinCode;

    public CreateCompanyDto(Company company) {
        this.name = company.getName();
        this.joinCode = company.getJoinCode();
    }
}
