package com.example.Mind_Forge.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "shift_violation_notifications")
@Getter
@Setter
public class ShiftViolationNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "time_log_id", nullable = false)
    private TimeLog timeLog;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "notification_type", nullable = false)
    private String notificationType; // "WARNING", "AUTO_CLOCKOUT"

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "is_delivered")
    private Boolean isDelivered = false;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "distance_from_workarea")
    private Double distanceFromWorkarea;

    // Default constructor
    public ShiftViolationNotification() {
    }
}
