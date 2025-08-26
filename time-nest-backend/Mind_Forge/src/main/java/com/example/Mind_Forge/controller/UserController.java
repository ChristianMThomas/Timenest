package com.example.Mind_Forge.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Mind_Forge.dto.user.UpdateUsernameDto;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.response.UserResponse;
import com.example.Mind_Forge.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequestMapping("/users")
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        UserResponse response = new UserResponse(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/username")
    public ResponseEntity<UserResponse> updateUsername(@RequestBody UpdateUsernameDto input) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        String formattedUsername = input.getNewUsername().replaceAll("\\s+", "_");
        currentUser.setUsername(formattedUsername);

        User updatedUser = userService.save(currentUser);

        UserResponse response = new UserResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail());

        // Log info to see if it is fetching the actual username so we can display it to
        // frontend
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<UserResponse> deleteUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        userService.deleteById(currentUser.getId());

        UserResponse response = new UserResponse(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getEmail());

        return ResponseEntity.ok(response);
    }

    /*
     * For secuirty reason this route will be disabled
     * 
     * @GetMapping("/")
     * public ResponseEntity<List<User>> allUsers() {
     * List<User> users = userService.getAllUsers();
     * return ResponseEntity.ok(users);
     * }
     */

}