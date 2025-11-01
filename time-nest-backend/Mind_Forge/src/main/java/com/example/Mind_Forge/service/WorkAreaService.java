package com.example.Mind_Forge.service;

import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.model.WorkArea;
import com.example.Mind_Forge.repository.TimeLogRepository;
import com.example.Mind_Forge.repository.WorkAreaRepository;
import com.example.Mind_Forge.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class WorkAreaService {
    private final WorkAreaRepository workAreaRepository;
    private final UserRepository userRepository;
    private final TimeLogRepository timeLogRepository;

    private static final Logger log = LoggerFactory.getLogger(WorkAreaService.class);
    private static final double EARTH_RADIUS_METERS = 6371000; // Earth's radius in meters

    public WorkAreaService(WorkAreaRepository workAreaRepository, UserRepository userRepository, TimeLogRepository timeLogRepository) {
        this.workAreaRepository = workAreaRepository;
        this.userRepository = userRepository;
        this.timeLogRepository = timeLogRepository;
    }

    /**
     * Get the authenticated user from security context
     */
    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : principal.toString();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    /**
     * Create a new work area (executives only)
     */
    @Transactional
    public WorkArea createWorkArea(String name, String address, Double latitude, Double longitude,
            Double radiusMeters) {
        User user = getAuthenticatedUser();

        if (user.getCompany() == null) {
            throw new IllegalStateException("User must belong to a company to create work areas");
        }

        if (!"executive".equals(user.getRole())) {
            throw new SecurityException("Only executives can create work areas");
        }

        WorkArea workArea = new WorkArea(name, latitude, longitude, radiusMeters, user.getCompany());
        workArea.setAddress(address);

        WorkArea saved = workAreaRepository.save(workArea);
        log.info("Created work area '{}' for company {}", name, user.getCompany().getName());

        return saved;
    }

    /**
     * Get all work areas for the authenticated user's company
     */
    public List<WorkArea> getAllWorkAreas() {
        User user = getAuthenticatedUser();

        if (user.getCompany() == null) {
            throw new IllegalStateException("User must belong to a company");
        }

        return workAreaRepository.findByCompany(user.getCompany());
    }

    /**
     * Get only active work areas for the authenticated user's company
     */
    public List<WorkArea> getActiveWorkAreas() {
        User user = getAuthenticatedUser();

        if (user.getCompany() == null) {
            throw new IllegalStateException("User must belong to a company");
        }

        return workAreaRepository.findByCompanyAndActiveTrue(user.getCompany());
    }

    /**
     * Get a specific work area by ID (ensures it belongs to user's company)
     */
    public WorkArea getWorkAreaById(Long id) {
        User user = getAuthenticatedUser();

        if (user.getCompany() == null) {
            throw new IllegalStateException("User must belong to a company");
        }

        return workAreaRepository.findByIdAndCompany(id, user.getCompany())
                .orElseThrow(() -> new NoSuchElementException("Work area not found or access denied"));
    }

    /**
     * Update a work area (executives only)
     */
    @Transactional
    public WorkArea updateWorkArea(Long id, String name, String address, Double latitude, Double longitude,
            Double radiusMeters, Boolean active) {
        User user = getAuthenticatedUser();

        if (!"executive".equals(user.getRole())) {
            throw new SecurityException("Only executives can update work areas");
        }

        WorkArea existing = getWorkAreaById(id);

        if (name != null) {
            existing.setName(name);
        }
        if (address != null) {
            existing.setAddress(address);
        }
        if (latitude != null) {
            existing.setLatitude(latitude);
        }
        if (longitude != null) {
            existing.setLongitude(longitude);
        }
        if (radiusMeters != null) {
            existing.setRadiusMeters(radiusMeters);
        }
        if (active != null) {
            existing.setActive(active);
        }

        WorkArea updated = workAreaRepository.save(existing);
        log.info("Updated work area '{}' (ID: {})", updated.getName(), id);

        return updated;
    }

    /**
     * Permanently delete a work area from the database (executives only)
     */
    @Transactional
    public void deleteWorkArea(Long id) {
        User user = getAuthenticatedUser();

        if (!"executive".equals(user.getRole())) {
            throw new SecurityException("Only executives can delete work areas");
        }

        WorkArea workArea = getWorkAreaById(id);
        String workAreaName = workArea.getName();

        // First, nullify the workArea reference in any TimeLogs that reference it
        List<TimeLog> relatedTimeLogs = timeLogRepository.findByWorkArea(workArea);
        if (!relatedTimeLogs.isEmpty()) {
            log.info("Nullifying workArea reference in {} time logs before deletion", relatedTimeLogs.size());
            for (TimeLog timeLog : relatedTimeLogs) {
                timeLog.setWorkArea(null);
            }
            timeLogRepository.saveAll(relatedTimeLogs);
        }

        // Now permanently delete from database
        workAreaRepository.delete(workArea);

        log.info("Permanently deleted work area '{}' (ID: {})", workAreaName, id);
    }

    /**
     * Calculate distance between two geographic coordinates using Haversine formula
     *
     * @param lat1 Latitude of point 1
     * @param lon1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lon2 Longitude of point 2
     * @return Distance in meters
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }

    /**
     * Validate if given coordinates are within a work area's geofence
     *
     * @param workAreaId       ID of the work area to check
     * @param currentLatitude  Current latitude of the user
     * @param currentLongitude Current longitude of the user
     * @return true if within geofence, false otherwise
     */
    public boolean isWithinGeofence(Long workAreaId, double currentLatitude, double currentLongitude) {
        WorkArea workArea = getWorkAreaById(workAreaId);

        if (!workArea.getActive()) {
            throw new IllegalStateException("Work area is not active");
        }

        double distance = calculateDistance(
                workArea.getLatitude(),
                workArea.getLongitude(),
                currentLatitude,
                currentLongitude);

        log.debug("Distance to work area '{}': {} meters (radius: {} meters)",
                workArea.getName(), distance, workArea.getRadiusMeters());

        return distance <= workArea.getRadiusMeters();
    }

    /**
     * Validate geofence and throw exception if not within range
     */
    public void validateGeofence(Long workAreaId, double currentLatitude, double currentLongitude) {
        WorkArea workArea = getWorkAreaById(workAreaId);

        double distance = calculateDistance(
                workArea.getLatitude(),
                workArea.getLongitude(),
                currentLatitude,
                currentLongitude);

        if (distance > workArea.getRadiusMeters()) {
            throw new SecurityException(
                    String.format("You are %.0f meters away from '%s'. You must be within %.0f meters to clock in.",
                            distance, workArea.getName(), workArea.getRadiusMeters()));
        }

        log.info("Geofence validation passed for work area '{}' (distance: {} meters)", workArea.getName(), distance);
    }
}
