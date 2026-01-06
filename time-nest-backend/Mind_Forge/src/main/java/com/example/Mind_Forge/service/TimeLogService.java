package com.example.Mind_Forge.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.Mind_Forge.dto.timelog.CreateTimeLogDto;
import com.example.Mind_Forge.dto.timelog.LocationHeartbeatDto;
import com.example.Mind_Forge.dto.timelog.UpdateTimeLogDto;
import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.model.WorkArea;
import com.example.Mind_Forge.repository.CompanyRepository;
import com.example.Mind_Forge.repository.TimeLogRepository;
import com.example.Mind_Forge.repository.UserRepository;

@Service
public class TimeLogService {

    private static final Logger logger = LoggerFactory.getLogger(TimeLogService.class);

    private final TimeLogRepository timeLogRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final WorkAreaService workAreaService;

    public TimeLogService(TimeLogRepository timeLogRepository,
            UserRepository userRepository,
            CompanyRepository companyRepository,
            WorkAreaService workAreaService) {
        this.timeLogRepository = timeLogRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.workAreaService = workAreaService;
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
        timeLog.setStartTime(input.getStartTime());
        timeLog.setEndTime(input.getEndTime());
        timeLog.setHours(input.getHours());
        timeLog.setCompany(user.getCompany());

        // Handle work area and geofence validation
        if (input.getWorkAreaId() != null) {
            if (input.getCheckInLatitude() == null || input.getCheckInLongitude() == null) {
                throw new IllegalArgumentException("Check-in coordinates are required when logging time at a work area");
            }

            // Validate geofence - throws exception if not within range
            workAreaService.validateGeofence(
                    input.getWorkAreaId(),
                    input.getCheckInLatitude(),
                    input.getCheckInLongitude());

            // Get the work area and set it on the time log
            WorkArea workArea = workAreaService.getWorkAreaById(input.getWorkAreaId());
            timeLog.setWorkArea(workArea);
            timeLog.setCheckInLatitude(input.getCheckInLatitude());
            timeLog.setCheckInLongitude(input.getCheckInLongitude());

            // Set location from work area name if not provided
            if (input.getLocation() == null || input.getLocation().isBlank()) {
                timeLog.setLocation(workArea.getName());
            } else {
                timeLog.setLocation(input.getLocation());
            }

            logger.info("Employee '{}' clocked in at work area '{}' (distance validated)",
                    user.getEmail(), workArea.getName());
        } else {
            // Legacy support: allow location without work area
            timeLog.setLocation(input.getLocation());
        }

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

    // Shift lifecycle methods for active shift monitoring

    @Transactional
    public TimeLog startActiveShift(CreateTimeLogDto input) {
        User user = getAuthenticatedUser();

        if (!user.getRole().equalsIgnoreCase("employee")) {
            throw new AccessDeniedException("Only employees can start shifts");
        }

        // Check if user already has an active shift
        Optional<TimeLog> existingShift = timeLogRepository.findByUserAndIsActiveShiftTrue(user);
        if (existingShift.isPresent()) {
            throw new IllegalStateException("You already have an active shift. Please clock out first.");
        }

        // Validate geofence at clock-in
        if (input.getWorkAreaId() == null || input.getCheckInLatitude() == null ||
                input.getCheckInLongitude() == null) {
            throw new IllegalArgumentException("Work area and location are required to start shift");
        }

        workAreaService.validateGeofence(
                input.getWorkAreaId(),
                input.getCheckInLatitude(),
                input.getCheckInLongitude()
        );

        // Create active shift
        TimeLog timeLog = new TimeLog();
        timeLog.setUser(user);
        timeLog.setCompany(user.getCompany());
        timeLog.setStartTime(LocalDateTime.now());
        timeLog.setIsActiveShift(true);

        WorkArea workArea = workAreaService.getWorkAreaById(input.getWorkAreaId());
        timeLog.setWorkArea(workArea);
        timeLog.setLocation(workArea.getName());

        // Set initial location
        timeLog.setCheckInLatitude(input.getCheckInLatitude());
        timeLog.setCheckInLongitude(input.getCheckInLongitude());
        timeLog.setCurrentLatitude(input.getCheckInLatitude());
        timeLog.setCurrentLongitude(input.getCheckInLongitude());
        timeLog.setLastLocationCheck(LocalDateTime.now());

        // Initialize violation tracking
        timeLog.setViolationCount(0);
        timeLog.setAutoClockedOut(false);

        TimeLog saved = timeLogRepository.save(timeLog);
        logger.info("Started active shift {} for user {}", saved.getId(), user.getEmail());

        return saved;
    }

    @Transactional
    public void updateLocationHeartbeat(LocationHeartbeatDto heartbeat) {
        User user = getAuthenticatedUser();

        logger.info("Heartbeat received from user: {}", user.getEmail());
        logger.debug("Heartbeat data - Lat: {}, Lng: {}, Timestamp: {}",
                heartbeat.getLatitude(), heartbeat.getLongitude(), heartbeat.getTimestamp());

        Optional<TimeLog> activeShiftOpt = timeLogRepository.findByUserAndIsActiveShiftTrue(user);
        if (activeShiftOpt.isEmpty()) {
            logger.warn("No active shift found for user {} - heartbeat rejected", user.getEmail());
            throw new IllegalStateException("No active shift found");
        }

        TimeLog timeLog = activeShiftOpt.get();
        LocalDateTime beforeUpdate = timeLog.getLastLocationCheck();

        // OPTIMIZATION: Only update coordinates if significant movement detected
        boolean hasSignificantMovement = calculateSignificantMovement(
            timeLog.getCurrentLatitude(),
            timeLog.getCurrentLongitude(),
            heartbeat.getLatitude(),
            heartbeat.getLongitude()
        );

        boolean isStaleLocation = beforeUpdate == null ||
                                  beforeUpdate.isBefore(LocalDateTime.now().minusMinutes(5));

        if (hasSignificantMovement || isStaleLocation) {
            // Update full location data
            timeLog.setCurrentLatitude(heartbeat.getLatitude());
            timeLog.setCurrentLongitude(heartbeat.getLongitude());
            timeLog.setLastLocationCheck(LocalDateTime.now());

            logger.info("Updated location for shift {} (movement detected)", timeLog.getId());
        } else {
            // Just refresh timestamp - employee hasn't moved significantly
            timeLog.setLastLocationCheck(LocalDateTime.now());
            logger.debug("Refreshed timestamp for shift {} (no significant movement)", timeLog.getId());
        }

        // REAL-TIME GEOFENCE CHECKING
        WorkArea workArea = timeLog.getWorkArea();
        if (workArea != null) {
            checkGeofenceViolationRealtime(timeLog, workArea, heartbeat.getLatitude(), heartbeat.getLongitude());
        }

        timeLogRepository.save(timeLog);

        logger.info("Heartbeat processed for shift ID {} - Previous check: {}, New check: {}",
                timeLog.getId(), beforeUpdate, timeLog.getLastLocationCheck());
    }

    private void checkGeofenceViolationRealtime(TimeLog timeLog, WorkArea workArea, Double latitude, Double longitude) {
        // Calculate distance from work area
        double distance = workAreaService.calculateDistance(
                workArea.getLatitude(),
                workArea.getLongitude(),
                latitude,
                longitude
        );

        boolean outsideGeofence = distance > workArea.getRadiusMeters();
        int currentViolations = timeLog.getViolationCount() != null ? timeLog.getViolationCount() : 0;

        if (outsideGeofence) {
            // User is outside geofence
            if (currentViolations == 0) {
                // First violation - increment count and log warning
                timeLog.setViolationCount(1);
                timeLog.setFirstViolationTime(LocalDateTime.now());
                logger.warn("REAL-TIME: First geofence violation for user {} - Distance: {}m (limit: {}m)",
                        timeLog.getUser().getEmail(), Math.round(distance), Math.round(workArea.getRadiusMeters()));
            } else if (currentViolations == 1) {
                // Check if violation has been sustained for grace period (3 minutes)
                // Increased from 2 to 3 to account for brief tab suspensions on mobile
                LocalDateTime firstViolationTime = timeLog.getFirstViolationTime();
                if (firstViolationTime == null) {
                    firstViolationTime = LocalDateTime.now();
                    timeLog.setFirstViolationTime(firstViolationTime);
                }

                long minutesSinceFirstViolation = Duration.between(firstViolationTime, LocalDateTime.now()).toMinutes();

                if (minutesSinceFirstViolation >= 3) {
                    // Grace period elapsed - auto clock out
                    LocalDateTime detectionTime = LocalDateTime.now();
                    String reason = String.format("Remained outside work area for %d minutes (%.0f meters away)",
                            minutesSinceFirstViolation, distance);

                    logger.warn("REAL-TIME: Second geofence violation for user {} - AUTO CLOCK OUT. Reason: {}",
                            timeLog.getUser().getEmail(), reason);

                    // Auto clock out
                    timeLog.setEndTime(detectionTime);
                    timeLog.setIsActiveShift(false);
                    timeLog.setAutoClockedOut(true);
                    timeLog.setAutoClockoutReason(reason);
                    timeLog.setViolationCount(2);

                    // Calculate hours worked
                    long durationMillis = Duration.between(timeLog.getStartTime(), detectionTime).toMillis();
                    double hours = durationMillis / (1000.0 * 60 * 60);
                    timeLog.setHours(hours);

                    logger.info("REAL-TIME: Auto clocked out user {} at {} - Duration: {} hours",
                            timeLog.getUser().getEmail(), detectionTime, hours);
                } else {
                    logger.debug("REAL-TIME: User {} still outside geofence but within grace period ({} min elapsed)",
                            timeLog.getUser().getEmail(), minutesSinceFirstViolation);
                }
            }
        } else {
            // User is back inside geofence - reset violations if any
            if (currentViolations > 0) {
                logger.info("REAL-TIME: User {} returned to compliance, resetting violations",
                        timeLog.getUser().getEmail());
                timeLog.setViolationCount(0);
                timeLog.setFirstViolationTime(null);
            }
        }
    }

    @Transactional
    public TimeLog endActiveShift() {
        User user = getAuthenticatedUser();

        Optional<TimeLog> activeShiftOpt = timeLogRepository.findByUserAndIsActiveShiftTrue(user);
        if (activeShiftOpt.isEmpty()) {
            throw new IllegalStateException("No active shift found to end");
        }

        TimeLog timeLog = activeShiftOpt.get();

        // Mark shift as ended
        LocalDateTime endTime = LocalDateTime.now();
        timeLog.setEndTime(endTime);
        timeLog.setIsActiveShift(false);

        // Calculate hours
        long durationMillis = Duration.between(timeLog.getStartTime(), endTime).toMillis();
        double hours = durationMillis / (1000.0 * 60 * 60);
        timeLog.setHours(hours);

        TimeLog saved = timeLogRepository.save(timeLog);
        logger.info("Ended shift {} for user {} - Duration: {} hours",
                saved.getId(), user.getEmail(), hours);

        return saved;
    }

    public TimeLog getActiveShift() {
        User user = getAuthenticatedUser();
        return timeLogRepository.findByUserAndIsActiveShiftTrue(user).orElse(null);
    }

    private boolean calculateSignificantMovement(Double lat1, Double lon1, Double lat2, Double lon2) {
        // If no previous location, consider it significant
        if (lat1 == null || lon1 == null) {
            return true;
        }

        // Use existing WorkAreaService distance calculation
        double distanceMeters = workAreaService.calculateDistance(lat1, lon1, lat2, lon2);

        // Consider movement significant if >10 meters
        // This filters out GPS jitter for stationary employees
        return distanceMeters > 10.0;
    }
}