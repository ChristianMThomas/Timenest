package com.example.Mind_Forge.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "timelogs")
@Getter
@Setter
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "location", nullable = false)
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

    // Default constructor
    public TimeLog() {}

    // Constructor with fields
    public TimeLog(String location, LocalDateTime startTime, LocalDateTime endTime, Double hours, User user) {
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.hours = hours;
        this.user = user;
    }
}