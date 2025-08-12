package com.example.Mind_Forge.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Mind_Forge.dto.user.LoginUserDto;
import com.example.Mind_Forge.dto.user.RegisterUserDto;
import com.example.Mind_Forge.dto.user.VerifyUserDto;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.response.ApiMessage;
import com.example.Mind_Forge.response.LoginResponse;
import com.example.Mind_Forge.response.UserResponse;
import com.example.Mind_Forge.service.AuthenticationService;
import com.example.Mind_Forge.service.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterUserDto rUserDto) {
        User registeredUser = authenticationService.register(rUserDto);

        UserResponse response = new UserResponse(
                registeredUser.getId(),
                registeredUser.getUsername(),
                registeredUser.getEmail());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto lUserDto) {
        User authenticatedUser = authenticationService.authenticate(lUserDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getExpirationTime());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiMessage> verifyUser(@RequestBody VerifyUserDto vUserDto) {
        try {
            authenticationService.verifyUser(vUserDto);
            return ResponseEntity
                    .status(HttpStatus.ACCEPTED)
                    .body(new ApiMessage("Verification successful", HttpStatus.ACCEPTED.value()));
        } catch (RuntimeException runtimeException) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiMessage("Invalid input data", HttpStatus.BAD_REQUEST.value()));
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity
                    .status(HttpStatus.ACCEPTED)
                    .body(new ApiMessage("Verification has been sent. Please check you email",
                            HttpStatus.ACCEPTED.value()));
        } catch (RuntimeException runtimeException) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiMessage("Couldn't send Verification code", HttpStatus.BAD_REQUEST.value()));
        }

    }
}
