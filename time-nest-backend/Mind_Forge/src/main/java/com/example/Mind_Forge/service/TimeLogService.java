package com.example.Mind_Forge.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.Mind_Forge.dto.timelog.CreateTimeLogDto;
import com.example.Mind_Forge.dto.timelog.UpdateTimeLogDto;
import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.repository.CompanyRepository;
import com.example.Mind_Forge.repository.TimeLogRepository;
import com.example.Mind_Forge.repository.UserRepository;

@Service
public class TimeLogService {

    private static final Logger logger = LoggerFactory.getLogger(TimeLogService.class);

    private final TimeLogRepository timeLogRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public TimeLogService(TimeLogRepository timeLogRepository,
            UserRepository userRepository,
            CompanyRepository companyRepository) {
        this.timeLogRepository = timeLogRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : principal.toString();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    public TimeLog createTimeLog(CreateTimeLogDto input) {
        User user = getAuthenticatedUser();

        if (!user.getRole().equalsIgnoreCase("employee")) {
            logger.warn("Access denied: User '{}' attempted to create a time log without EMPLOYEE role",
                    user.getEmail());
            throw new AccessDeniedException("Only employees can log time");
        }

        if (user.getCompany() == null) {
            logger.warn("Access denied: Employee '{}' has no company assigned", user.getEmail());
            throw new IllegalStateException("User must belong to a company to log time");
        }

        TimeLog timeLog = new TimeLog();
        timeLog.setUser(user);
        timeLog.setLocation(input.getLocation());
        timeLog.setStartTime(input.getStartTime());
        timeLog.setEndTime(input.getEndTime());
        timeLog.setHours(input.getHours());
        timeLog.setCompany(user.getCompany());

        return timeLogRepository.save(timeLog);
    }

    public TimeLog updateTimeLog(Long timeLogId, UpdateTimeLogDto input) {
        User user = getAuthenticatedUser();

        if (!user.getRole().equalsIgnoreCase("executive")) {
            logger.warn("Access denied: User '{}' attempted to update time log ID {} without EXECUTIVE role",
                    user.getEmail(), timeLogId);
            throw new AccessDeniedException("Only executives can update time logs");
        }

        TimeLog timeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new RuntimeException("Time log not found"));

        if (!timeLog.getCompany().getId().equals(user.getCompany().getId())) {
            logger.warn(
                    "Access denied: Executive '{}' tried to update time log ID {} from another company (log company ID: {}, user company ID: {})",
                    user.getEmail(), timeLogId, timeLog.getCompany().getId(), user.getCompany().getId());
            throw new AccessDeniedException("You can only update logs for your own company");
        }

        if (input.getStartTime() != null)
            timeLog.setStartTime(input.getStartTime());
        if (input.getEndTime() != null)
            timeLog.setEndTime(input.getEndTime());
        if (input.getHours() != null)
            timeLog.setHours(input.getHours());
        if (input.getLocation() != null && !input.getLocation().isBlank())
            timeLog.setLocation(input.getLocation());

        return timeLogRepository.save(timeLog);
    }

    public List<TimeLog> displayUserTimeLogs() {
        User user = getAuthenticatedUser();
        return timeLogRepository.findByUser(user);
    }

    public List<TimeLog> displayTimeLogsByLocation(String location) {
        return timeLogRepository.findByLocation(location);
    }

    public TimeLog getTimeLogById(Long id) {
        return timeLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time log not found with ID: " + id));
    }

    public List<TimeLog> getTimeLogsByCompany(Long companyId) {
        User user = getAuthenticatedUser();

        if (!user.getRole().equalsIgnoreCase("executive")) {
            logger.warn("Access denied: User '{}' attempted to view company logs without EXECUTIVE role",
                    user.getEmail());
            throw new AccessDeniedException("Only executives can view company time logs");
        }

        if (user.getCompany() == null || !user.getCompany().getId().equals(companyId)) {
            logger.warn(
                    "Access denied: Executive '{}' tried to access logs for company ID {} but belongs to company ID {}",
                    user.getEmail(), companyId, user.getCompany() != null ? user.getCompany().getId() : null);
            throw new AccessDeniedException("You can only view logs for your own company");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        return timeLogRepository.findByCompany(company);
    }

    public void deleteTimeLog(Long id) {
        User user = getAuthenticatedUser();

        if (!user.getRole().equalsIgnoreCase("executive")) {
            logger.warn("Access denied: User '{}' attempted to delete time log ID {} without EXECUTIVE role",
                    user.getEmail(), id);
            throw new AccessDeniedException("Only executives can delete time logs");
        }

        TimeLog timeLog = timeLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time log not found"));

        if (!timeLog.getCompany().getId().equals(user.getCompany().getId())) {
            logger.warn(
                    "Access denied: Executive '{}' tried to delete time log ID {} from another company (log company ID: {}, user company ID: {})",
                    user.getEmail(), id, timeLog.getCompany().getId(), user.getCompany().getId());
            throw new AccessDeniedException("You can only delete logs for your own company");
        }

        timeLogRepository.deleteById(id);
    }
}