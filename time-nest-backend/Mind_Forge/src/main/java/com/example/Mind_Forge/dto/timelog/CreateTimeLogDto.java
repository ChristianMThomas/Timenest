package com.example.Mind_Forge.dto.timelog;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CreateTimeLogDto {
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double hours;

    // Getters and setters or use Lombok
}
