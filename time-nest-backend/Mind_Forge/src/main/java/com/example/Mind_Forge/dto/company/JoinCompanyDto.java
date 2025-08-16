package com.example.Mind_Forge.dto.company;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinCompanyDto {

    private String joinCode;

    public JoinCompanyDto(String joinCode) {
        this.joinCode = joinCode;
    }

}
