package com.example.Mind_Forge.response;

import com.example.Mind_Forge.model.TimeLog;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeLogResponse {
    private Long id;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double hours;
    private String username;

    public static TimeLogResponse fromEntity(TimeLog log) {
        return new TimeLogResponse(
            log.getId(),
            log.getLocation(),
            log.getStartTime(),
            log.getEndTime(),
            log.getHours(),
            log.getUser().getActualUsername()  // Use actual username, not email
        );
    }
}