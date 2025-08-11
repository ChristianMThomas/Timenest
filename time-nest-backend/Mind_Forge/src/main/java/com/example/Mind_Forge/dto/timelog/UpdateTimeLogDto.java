package com.example.Mind_Forge.dto.timelog;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTimeLogDto {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double hours;
    private String location;

    // Getters and setters or use Lombok
}
