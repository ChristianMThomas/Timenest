package com.example.Mind_Forge.dto.timelog;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class LocationHeartbeatDto {

    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
}
