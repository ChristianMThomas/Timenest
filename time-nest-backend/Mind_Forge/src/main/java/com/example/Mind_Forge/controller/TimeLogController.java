package com.example.Mind_Forge.controller;

import com.example.Mind_Forge.dto.timelog.CreateTimeLogDto;
import com.example.Mind_Forge.dto.timelog.UpdateTimeLogDto;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.service.TimeLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/timelogs")
public class TimeLogController {

    private final TimeLogService timeLogService;

    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    //  Get a specific time log by ID
    @GetMapping("/{id}")
    public ResponseEntity<TimeLog> getTimeLogById(@PathVariable Long id) {
        return ResponseEntity.ok(timeLogService.getTimeLogById(id));
    }

    //  Get all time logs for the authenticated user
    @GetMapping("/me")
    public ResponseEntity<List<TimeLog>> getMyTimeLogs() {
        List<TimeLog> userLogs = timeLogService.displayUserTimeLogs(); // uses JWT
        return ResponseEntity.ok(userLogs);
    }

    // Get all time logs for a specific location
    @GetMapping("/location/{location}")
    public ResponseEntity<List<TimeLog>> getTimeLogsByLocation(@PathVariable String location) {
        List<TimeLog> logs = timeLogService.displayTimeLogsByLocation(location);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<TimeLog>> getTimeLogsByCompany(@PathVariable Long companyId) {
        List<TimeLog> logs = timeLogService.getTimeLogsByCompany(companyId);
        return ResponseEntity.ok(logs);
    }

    // Create a new time log (EMPLOYEE only)
    @PostMapping
    public ResponseEntity<TimeLog> createTimeLog(@RequestBody CreateTimeLogDto timeLog) {
        TimeLog created = timeLogService.createTimeLog(timeLog);
        return ResponseEntity.ok(created);
    }

    //  Update an existing time log (EXECUTIVE only)
    @PutMapping("/{id}")
    public ResponseEntity<TimeLog> updateTimeLog(@PathVariable Long id, @RequestBody UpdateTimeLogDto timeLog) {
        TimeLog updated = timeLogService.updateTimeLog(id, timeLog);
        return ResponseEntity.ok(updated);
    }

    //  Delete a time log (EXECUTIVE only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeLog(@PathVariable Long id) {
        timeLogService.deleteTimeLog(id);
        return ResponseEntity.noContent().build();
    }
}