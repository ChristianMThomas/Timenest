package com.example.Mind_Forge.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TimeLogResponse {
    private Long id;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double hours;

    public TimeLogResponse(Long id, String location, LocalDateTime startTime, LocalDateTime endTime, Double hours) {
        this.id = id;
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.hours = hours;
    }
}
