package com.example.Mind_Forge.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDto {
    private String email;
    private String newUsername;
    private String currentPassword;
    private String newPassword;
    private String newCompanyJoinCode;



}