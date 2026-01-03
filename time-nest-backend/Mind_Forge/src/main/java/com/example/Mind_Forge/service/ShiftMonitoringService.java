package com.example.Mind_Forge.service;

import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.ShiftViolationNotification;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.model.WorkArea;
import com.example.Mind_Forge.repository.ShiftViolationNotificationRepository;
import com.example.Mind_Forge.repository.TimeLogRepository;
import com.example.Mind_Forge.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ShiftMonitoringService {

    private final TimeLogRepository timeLogRepository;
    private final ShiftViolationNotificationRepository notificationRepository;
    private final WorkAreaService workAreaService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    private static final Logger log = LoggerFactory.getLogger(ShiftMonitoringService.class);
    private static final int HEARTBEAT_TIMEOUT_MINUTES = 3; // Reduced for faster detection (max 10min to auto-clockout)

    public ShiftMonitoringService(
            TimeLogRepository timeLogRepository,
            ShiftViolationNotificationRepository notificationRepository,
            WorkAreaService workAreaService,
            EmailService emailService,
            UserRepository userRepository) {
        this.timeLogRepository = timeLogRepository;
        this.notificationRepository = notificationRepository;
        this.workAreaService = workAreaService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    // Called by scheduled job every 5 minutes
    @Transactional
    public void checkAllActiveShifts() {
        log.info("Starting scheduled shift monitoring check");

        LocalDateTime thresholdTime = LocalDateTime.now().minusMinutes(HEARTBEAT_TIMEOUT_MINUTES);
        List<TimeLog> activeShifts = timeLogRepository.findActiveShiftsNeedingCheck(thresholdTime);

        log.info("Found {} active shifts to check", activeShifts.size());

        for (TimeLog timeLog : activeShifts) {
            try {
                checkShiftCompliance(timeLog);
            } catch (Exception e) {
                log.error("Error checking shift {} for user {}",
                        timeLog.getId(), timeLog.getUser().getEmail(), e);
            }
        }
    }

    @Transactional
    private void checkShiftCompliance(TimeLog timeLog) {
        User user = timeLog.getUser();
        WorkArea workArea = timeLog.getWorkArea();

        if (workArea == null) {
            log.warn("TimeLog {} has no work area assigned, skipping", timeLog.getId());
            return;
        }

        // Check if location data is stale (no heartbeat received)
        boolean locationStale = timeLog.getLastLocationCheck() == null ||
                timeLog.getLastLocationCheck().isBefore(LocalDateTime.now().minusMinutes(HEARTBEAT_TIMEOUT_MINUTES));

        // Check geofence if we have recent location data
        boolean outsideGeofence = false;
        double distance = 0;

        if (!locationStale && timeLog.getCurrentLatitude() != null && timeLog.getCurrentLongitude() != null) {
            distance = workAreaService.calculateDistance(
                    workArea.getLatitude(),
                    workArea.getLongitude(),
                    timeLog.getCurrentLatitude(),
                    timeLog.getCurrentLongitude()
            );
            outsideGeofence = distance > workArea.getRadiusMeters();
        }

        // Determine violation status
        boolean isViolating = locationStale || outsideGeofence;

        if (!isViolating) {
            // Employee is compliant - reset violation count if they returned
            if (timeLog.getViolationCount() != null && timeLog.getViolationCount() > 0) {
                log.info("User {} returned to compliance, resetting violations", user.getEmail());
                timeLog.setViolationCount(0);
                timeLog.setFirstViolationTime(null);
                timeLogRepository.save(timeLog);
            }
            return;
        }

        // Violation detected
        int currentViolations = timeLog.getViolationCount() != null ? timeLog.getViolationCount() : 0;

        if (currentViolations == 0) {
            // First violation - send warning
            handleFirstViolation(timeLog, locationStale, distance, workArea);
        } else if (currentViolations == 1) {
            // Second violation - auto clock out
            handleSecondViolation(timeLog, locationStale, distance, workArea);
        }
        // If violations > 1, already handled (edge case: multiple checks before processing)
    }

    private void handleFirstViolation(TimeLog timeLog, boolean locationStale,
                                       double distance, WorkArea workArea) {
        User user = timeLog.getUser();

        String reason = locationStale
                ? "Location signal lost - app may be closed or location services disabled"
                : String.format("Outside work area (%.0f meters away, must be within %.0f meters)",
                distance, workArea.getRadiusMeters());

        log.warn("First violation for user {} - Reason: {}", user.getEmail(), reason);

        // Update violation count
        timeLog.setViolationCount(1);
        timeLog.setFirstViolationTime(LocalDateTime.now());
        timeLogRepository.save(timeLog);

        // Create warning notification
        ShiftViolationNotification notification = new ShiftViolationNotification();
        notification.setTimeLog(timeLog);
        notification.setUser(user);
        notification.setNotificationType("WARNING");
        notification.setMessage("Warning: " + reason + ". Please return to work area immediately or you will be automatically clocked out.");
        notification.setLatitude(timeLog.getCurrentLatitude());
        notification.setLongitude(timeLog.getCurrentLongitude());
        notification.setDistanceFromWorkarea(distance);
        notificationRepository.save(notification);

        log.info("Created warning notification for user {}", user.getEmail());
    }

    private void handleSecondViolation(TimeLog timeLog, boolean locationStale,
                                        double distance, WorkArea workArea) {
        User user = timeLog.getUser();
        LocalDateTime detectionTime = LocalDateTime.now();

        String reason = locationStale
                ? "Location signal remained unavailable after warning"
                : String.format("Remained outside work area (%.0f meters away)", distance);

        log.warn("Second violation for user {} - AUTO CLOCK OUT. Reason: {}",
                user.getEmail(), reason);

        // Auto clock out using DETECTION TIME
        timeLog.setEndTime(detectionTime);
        timeLog.setIsActiveShift(false);
        timeLog.setAutoClockedOut(true);
        timeLog.setAutoClockoutReason(reason);
        timeLog.setViolationCount(2);

        // Calculate hours worked
        long durationMillis = Duration.between(timeLog.getStartTime(), detectionTime).toMillis();
        double hours = durationMillis / (1000.0 * 60 * 60);
        timeLog.setHours(hours);

        timeLogRepository.save(timeLog);

        // Create auto-clockout notification for employee
        ShiftViolationNotification notification = new ShiftViolationNotification();
        notification.setTimeLog(timeLog);
        notification.setUser(user);
        notification.setNotificationType("AUTO_CLOCKOUT");
        notification.setMessage("You have been automatically clocked out. Reason: " + reason);
        notification.setLatitude(timeLog.getCurrentLatitude());
        notification.setLongitude(timeLog.getCurrentLongitude());
        notification.setDistanceFromWorkarea(distance);
        notificationRepository.save(notification);

        // Send email to executives
        sendExecutiveNotification(timeLog, user, detectionTime, reason, distance);

        log.info("Auto clocked out user {} at {}", user.getEmail(), detectionTime);
    }

    private void sendExecutiveNotification(TimeLog timeLog, User employee,
                                            LocalDateTime clockoutTime, String reason, double distance) {
        Company company = employee.getCompany();
        if (company == null) {
            log.warn("Cannot send executive notification - employee has no company");
            return;
        }

        // Find all executives in the company
        List<User> executives = userRepository.findByCompanyAndRole(company, "executive");

        if (executives.isEmpty()) {
            log.warn("No executives found for company {}", company.getName());
            return;
        }

        // Format email
        String subject = String.format("Auto Clock-Out Alert: %s", employee.getActualUsername());
        String htmlContent = String.format("""
            <h2>Employee Automatically Clocked Out</h2>
            <p>An employee has been automatically clocked out due to geofence violation.</p>
            <hr>
            <p><strong>Employee:</strong> %s (%s)</p>
            <p><strong>Company:</strong> %s</p>
            <p><strong>Work Area:</strong> %s</p>
            <p><strong>Clock-out Time:</strong> %s</p>
            <p><strong>Reason:</strong> %s</p>
            <p><strong>Shift Duration:</strong> %.2f hours</p>
            <p><strong>Location Status:</strong> %.0f meters from work area</p>
            <hr>
            <p><em>This is an automated notification from TimeNest.</em></p>
            """,
                employee.getActualUsername(),
                employee.getEmail(),
                company.getName(),
                timeLog.getWorkArea().getName(),
                clockoutTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                reason,
                timeLog.getHours(),
                distance
        );

        // Send email to all executives
        for (User executive : executives) {
            try {
                emailService.sendVerificationEmail(executive.getEmail(), subject, htmlContent);
                log.info("Sent auto-clockout notification to executive {}", executive.getEmail());
            } catch (IOException e) {
                log.error("Failed to send email to executive {}", executive.getEmail(), e);
            }
        }
    }
}
