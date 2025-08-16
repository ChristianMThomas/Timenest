package com.example.Mind_Forge.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    // Disabling this method until admins exits
    /*
     * public List<User> getAllUsers() {
     * List<User> users = new ArrayList<>();
     * userRepository.findAll().forEach(users::add);
     * return users;
     * }
     */

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void deleteById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

}
