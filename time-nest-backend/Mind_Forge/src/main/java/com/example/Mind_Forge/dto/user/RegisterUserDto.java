package com.example.Mind_Forge.dto.user;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterUserDto {
    private String username;
    private String email;
    private String password;
    private String companyId; // optional if user selects a company
}


