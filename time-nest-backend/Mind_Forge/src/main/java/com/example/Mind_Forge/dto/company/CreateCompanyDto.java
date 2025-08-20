package com.example.Mind_Forge.dto.company;

import com.example.Mind_Forge.model.Company;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class CreateCompanyDto {
    private String name;
    private String joinCode;
    

    public CreateCompanyDto(Company company) {
        this.name = company.getName();
        this.joinCode = company.getJoinCode();
    }
}
