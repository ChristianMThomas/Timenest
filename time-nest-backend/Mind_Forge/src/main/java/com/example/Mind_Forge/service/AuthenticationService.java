package com.example.Mind_Forge.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.Mind_Forge.dto.user.LoginUserDto;
import com.example.Mind_Forge.dto.user.RegisterUserDto;
import com.example.Mind_Forge.dto.user.UpdateUserDto;
import com.example.Mind_Forge.dto.user.VerifyUserDto;
import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.PasswordResetToken;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.repository.CompanyRepository;
import com.example.Mind_Forge.repository.PasswordResetTokenRepository;
import com.example.Mind_Forge.repository.UserRepository;

import jakarta.mail.MessagingException;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final CompanyRepository companyRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    public AuthenticationService(UserRepository userRepository, CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager, EmailService emailService,
            PasswordResetTokenRepository tokenRepository,
            org.springframework.mail.javamail.JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.companyRepository = companyRepository;
        this.mailSender = mailSender;
        this.tokenRepository = tokenRepository;
    }

    public User register(RegisterUserDto input) {
        // Normalize email to lowercase and trim whitespace
        String normalizedEmail = input.getEmail().trim().toLowerCase();

        System.out.println("=== REGISTRATION DEBUG ===");
        System.out.println("Registering user with email: " + normalizedEmail);
        System.out.println("Username: " + input.getUsername());

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);
        if (existingUser.isPresent()) {
            System.out.println("ERROR: User already exists with email: " + normalizedEmail);
            throw new RuntimeException("User already exists with this email!");
        }

        User user = new User(input.getUsername(), normalizedEmail, passwordEncoder.encode(input.getPassword()),
                "user");
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        user.setEnabled(true); // Changed to true for development - CHANGE BACK TO false IN PRODUCTION!

        sendVerificationEmail(user);
        User savedUser = userRepository.save(user);
        System.out.println("User registered successfully with ID: " + savedUser.getId());
        return savedUser;
    }

    public User authenticate(LoginUserDto input) {
        System.out.println("=== AUTHENTICATION DEBUG ===");
        System.out.println("Attempting to authenticate user with email: " + input.getEmail());

        // Trim and lowercase the email to avoid issues
        String email = input.getEmail().trim().toLowerCase();
        System.out.println("Normalized email: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("ERROR: User not found in database for email: " + email);
                    return new RuntimeException("User not found! Please check your email and try again.");
                });

        System.out.println("User found: " + user.getEmail());
        System.out.println("User enabled: " + user.isEnabled());
        System.out.println("User role: " + user.getRole());

        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified! Please verify your account.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email, input.getPassword()));

        System.out.println("Authentication successful!");
        return user;
    }

    public void verifyUser(VerifyUserDto input) {
        Optional<User> optionalUsers = userRepository.findByEmail(input.getEmail());
        if (optionalUsers.isPresent()) {
            User user = optionalUsers.get();
            if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Uh oh! This Verification code has expired :< ");
            }

            if (user.getVerificationCode().equals(input.getVerificationCode())) {
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                user.setRole("user");
                userRepository.save(user);
            } else {
                throw new RuntimeException("User not found :C ");
            }
        }
    }

    public void resendVerificationCode(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.isEnabled()) {
                throw new RuntimeException("Account is already verified!");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
            sendVerificationEmail(user);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found D:");
        }
    }

    public void sendVerificationEmail(User user) {
        String subject = "Account Verification";
        String VerificationCode = user.getVerificationCode();
        String htmlMsg = "<html>"
                + "<body style=\"background-color:#f3f4f6; font-family:'Segoe UI', sans-serif; margin:0; padding:0;\">"
                + "<div style=\"max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:30px; text-align:center;\">"
                + "<div style=\"font-size:26px; color:#3b82f6; font-weight:600; margin-bottom:10px;\">Timenest</div>"
                + "<div style=\"font-size:22px; font-weight:500; color:#111827;\">Verify Your Email</div>"
                + "<div style=\"font-size:16px; color:#4b5563; margin:20px 0;\">Hello! We're excited to have you. Please use the verification code below to complete your registration.</div>"
                + "<div style=\"font-size:32px; font-weight:bold; letter-spacing:4px; color:#fffff; background-color:#3b82f6; padding:10px 20px; border-radius:8px; display:inline-block; margin-bottom:20px;\">"
                + VerificationCode + "</div>"
                + "<div style=\"font-size:16px; color:#4b5563; margin:20px 0;\">This code is valid for the next 15 minutes.</div>"
                + "<div style=\"font-size:14px; color:#9ca3af;\">If you did not request this code, feel free to ignore this message.<br /> Mind-Forge LLC</div>"
                + "</div>"
                + "</body>"
                + "</html>";

        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMsg);
        } catch (MessagingException exception) {
            exception.printStackTrace();
        }
    }

    private String generateVerificationCode() {
        Random rand = new Random();
        int code = rand.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

    public User updateUser(UpdateUserDto input) {
        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update username if provided
        if (input.getNewUsername() != null && !input.getNewUsername().isBlank()) {
            user.setUsername(input.getNewUsername());
        }

        // Update company if join code is provided
        if (input.getNewCompanyJoinCode() != null && !input.getNewCompanyJoinCode().isBlank()) {
            try {
                Company company = companyRepository.findByJoinCode("")
                        .orElseThrow(() -> new RuntimeException("Company not found with join code"));
                user.setCompany(company);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid join code format: must be a number");
            }
        }

        return userRepository.save(user);
    }

    public void updatePassword(UpdateUserDto input) {
        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(input.getEmail(), input.getCurrentPassword()));

        user.setPassword(passwordEncoder.encode(input.getNewPassword()));
        userRepository.save(user);
    }

    public void sendResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(resetToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Reset your Timenest password");
        message.setText("Click to reset: https://timenest.com/auth/reset-password?token=" + token);
        mailSender.send(message);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);
    }

}
