package com.example.Mind_Forge.service;

import java.util.List;

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

    private final TimeLogRepository timeLogRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public TimeLogService(TimeLogRepository timeLogRepository,
            UserRepository userRepository, CompanyRepository companyRepository) {
        this.timeLogRepository = timeLogRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;

    }

    public TimeLog createTimeLog(CreateTimeLogDto input) {
        // Get authenticated user
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : principal.toString();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Restrict to EMPLOYEE role only
        if (!user.getRole().equalsIgnoreCase("employee")) {
            throw new AccessDeniedException("Only employees can log time");
        }

        // 🏢 Optional: check if user belongs to a company
        if (user.getCompany() == null) {
            throw new IllegalStateException("User must belong to a company to log time");
        }

        // Create time log
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
        // Get authenticated user
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : principal.toString();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Restrict to EXECUTIVE role only
        if (!user.getRole().equalsIgnoreCase("executive")) {
            throw new AccessDeniedException("Only executives can update time logs");
        }

        TimeLog timeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new RuntimeException("Time log not found"));

        if (input.getStartTime() != null)
            timeLog.setStartTime(input.getStartTime());
        if (input.getEndTime() != null)
            timeLog.setEndTime(input.getEndTime());
        if (input.getHours() != null)
            timeLog.setHours(input.getHours());
        if (input.getLocation() != null && !input.getLocation().isBlank()) {
            timeLog.setLocation(input.getLocation());
        }

        return timeLogRepository.save(timeLog);
    }

    public List<TimeLog> displayUserTimeLogs() {
        // Get authenticated user from SecurityContext
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : principal.toString();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        return timeLogRepository.findByUser(user);
    }

    // Display time logs by location
    public List<TimeLog> displayTimeLogsByLocation(String location) {
        return timeLogRepository.findByLocation(location);
    }

    // Gets time log by the id
    public TimeLog getTimeLogById(Long id) {
        return timeLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time log not found with ID: " + id));
    }

    public List<TimeLog> getTimeLogsByCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        return timeLogRepository.findByCompany(company);
    }

    public void deleteTimeLog(Long id) {
        // Get authenticated user
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : principal.toString();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Restrict to EXECUTIVE role only
        if (!user.getRole().equalsIgnoreCase("EXECUTIVE")) {
            throw new AccessDeniedException("Only executives can delete time logs");
        }

        timeLogRepository.deleteById(id);
    }

}
