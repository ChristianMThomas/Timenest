package com.example.Mind_Forge.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.Mind_Forge.dto.timelog.CreateTimeLogDto;
import com.example.Mind_Forge.dto.timelog.UpdateTimeLogDto;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.repository.TimeLogRepository;
import com.example.Mind_Forge.repository.UserRepository;

@Service
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final UserRepository userRepository;

    public TimeLogService(TimeLogRepository timeLogRepository,
            UserRepository userRepository) {
        this.timeLogRepository = timeLogRepository;
        this.userRepository = userRepository;

    }

    // ✅ Create a new time log
    public TimeLog createTimeLog(CreateTimeLogDto input) {
        User user = userRepository.findById(input.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TimeLog timeLog = new TimeLog();
        timeLog.setUser(user);
        timeLog.setLocation(input.getLocation());
        timeLog.setStartTime(input.getStartTime());
        timeLog.setEndTime(input.getEndTime());
        timeLog.setHours(input.getHours());

        return timeLogRepository.save(timeLog);
    }

    // 🔄 Update an existing time log
    public TimeLog updateTimeLog(Long timeLogId, UpdateTimeLogDto input) {
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

    // Display time logs for a specific user
    public List<TimeLog> displayUserTimeLogs(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
    // ✅ Delete time log
    public void deleteTimeLog(Long id) {
        timeLogRepository.deleteById(id);
    }

}
