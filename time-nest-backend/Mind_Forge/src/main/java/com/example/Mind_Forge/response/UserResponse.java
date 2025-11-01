package com.example.Mind_Forge.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private CompanyInfo company;

    public UserResponse(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public UserResponse(Long id, String username, String email, String role, CompanyInfo company) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.company = company;
    }

    // Nested class for company info to avoid circular dependencies
    @Getter
    @Setter
    public static class CompanyInfo {
        private Long id;
        private String name;

        public CompanyInfo(Long id, String name) {
            this.id = id;
            this.name = name;
        }
    }
}
