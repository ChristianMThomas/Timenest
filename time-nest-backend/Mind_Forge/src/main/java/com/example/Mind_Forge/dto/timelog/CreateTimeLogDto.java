package com.example.Mind_Forge.dto.timelog;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTimeLogDto {
    private Long userId;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double hours;

    // Getters and setters or use Lombok
}
