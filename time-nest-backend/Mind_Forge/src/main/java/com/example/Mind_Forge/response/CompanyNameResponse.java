package com.example.Mind_Forge.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyNameResponse {

    private String name;

    public CompanyNameResponse(String name) {
        this.name = name;
    }
    
}
