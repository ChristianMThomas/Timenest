package com.example.Mind_Forge.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private Long expiresIn;
    private String role;
    private Long companyId;

    public LoginResponse(String token, Long expiresIn, String role, Long companyId) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.role = role;
        this.companyId = companyId;
    }
}
