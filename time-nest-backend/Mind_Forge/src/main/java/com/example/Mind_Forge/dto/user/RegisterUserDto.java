package com.example.Mind_Forge.dto.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserDto {
    private String username;
    private String email;
    private String password;
    private Long companyId; // optional if user selects a company
}


