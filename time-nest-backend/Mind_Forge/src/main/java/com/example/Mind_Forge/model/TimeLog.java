package com.example.Mind_Forge.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "timelogs", indexes = {
    @Index(name = "idx_active_shift", columnList = "is_active_shift"),
    @Index(name = "idx_last_location_check", columnList = "last_location_check"),
    @Index(name = "idx_user_active_shift", columnList = "user_id, is_active_shift"),
    @Index(name = "idx_active_shift_location_check", columnList = "is_active_shift, last_location_check")
})
@Getter
@Setter
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "location")
    private String location;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "hours")
    private Double hours;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_area_id")
    private WorkArea workArea;

    @Column(name = "check_in_latitude")
    private Double checkInLatitude;

    @Column(name = "check_in_longitude")
    private Double checkInLongitude;

    // Shift monitoring fields
    @Column(name = "is_active_shift")
    private Boolean isActiveShift = false;

    @Column(name = "last_location_check")
    private LocalDateTime lastLocationCheck;

    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "violation_count")
    private Integer violationCount = 0;

    @Column(name = "first_violation_time")
    private LocalDateTime firstViolationTime;

    @Column(name = "auto_clocked_out")
    private Boolean autoClockedOut = false;

    @Column(name = "auto_clockout_reason")
    private String autoClockoutReason;

    // Default constructor
    public TimeLog() {
    }

    // Constructor with fields
    public TimeLog(String location, LocalDateTime startTime, LocalDateTime endTime, Double hours, User user) {
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.hours = hours;
        this.user = user;
    }
}