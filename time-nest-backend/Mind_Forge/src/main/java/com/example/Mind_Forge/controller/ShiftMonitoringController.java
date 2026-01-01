package com.example.Mind_Forge.controller;

import com.example.Mind_Forge.dto.timelog.LocationHeartbeatDto;
import com.example.Mind_Forge.model.ShiftViolationNotification;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.repository.ShiftViolationNotificationRepository;
import com.example.Mind_Forge.repository.UserRepository;
import com.example.Mind_Forge.service.ShiftMonitoringService;
import com.example.Mind_Forge.service.TimeLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/shift-monitoring")
public class ShiftMonitoringController {

    private final ShiftMonitoringService monitoringService;
    private final TimeLogService timeLogService;
    private final ShiftViolationNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private static final Logger log = LoggerFactory.getLogger(ShiftMonitoringController.class);

    public ShiftMonitoringController(
            ShiftMonitoringService monitoringService,
            TimeLogService timeLogService,
            ShiftViolationNotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.monitoringService = monitoringService;
        this.timeLogService = timeLogService;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : principal.toString();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    // Endpoint for frontend to send location heartbeats
    @PostMapping("/heartbeat")
    public ResponseEntity<?> sendLocationHeartbeat(@RequestBody LocationHeartbeatDto heartbeat) {
        try {
            timeLogService.updateLocationHeartbeat(heartbeat);
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "Location updated"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    // Endpoint for frontend to poll for new notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<ShiftViolationNotification>> getUnreadNotifications() {
        User user = getAuthenticatedUser();
        List<ShiftViolationNotification> notifications =
                notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);

        // Mark as delivered (will be marked as read when user dismisses)
        notifications.forEach(n -> {
            if (!n.getIsDelivered()) {
                n.setIsDelivered(true);
            }
        });
        notificationRepository.saveAll(notifications);

        return ResponseEntity.ok(notifications);
    }

    // Mark notification as read
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable Long id) {
        User user = getAuthenticatedUser();

        Optional<ShiftViolationNotification> notificationOpt =
                notificationRepository.findById(id);

        if (notificationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ShiftViolationNotification notification = notificationOpt.get();

        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok().body(Map.of("success", true));
    }

    // Get count of unread notifications
    @GetMapping("/notifications/count")
    public ResponseEntity<Long> getUnreadCount() {
        User user = getAuthenticatedUser();
        Long count = notificationRepository.countByUserAndIsReadFalse(user);
        return ResponseEntity.ok(count);
    }

    // Endpoint for executives to manually trigger monitoring check (testing/debugging)
    @PostMapping("/trigger-check")
    public ResponseEntity<?> manualTriggerCheck() {
        User user = getAuthenticatedUser();

        if (!"executive".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Only executives can trigger manual checks"
            ));
        }

        try {
            monitoringService.checkAllActiveShifts();
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "Monitoring check triggered"
            ));
        } catch (Exception e) {
            log.error("Error during manual monitoring trigger", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }
}
