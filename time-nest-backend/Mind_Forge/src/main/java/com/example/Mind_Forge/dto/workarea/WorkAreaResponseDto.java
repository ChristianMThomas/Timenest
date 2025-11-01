package com.example.Mind_Forge.dto.workarea;

import com.example.Mind_Forge.model.WorkArea;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class WorkAreaResponseDto {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double radiusMeters;
    private Boolean active;
    private LocalDateTime createdAt;

    public WorkAreaResponseDto(WorkArea workArea) {
        this.id = workArea.getId();
        this.name = workArea.getName();
        this.address = workArea.getAddress();
        this.latitude = workArea.getLatitude();
        this.longitude = workArea.getLongitude();
        this.radiusMeters = workArea.getRadiusMeters();
        this.active = workArea.getActive();
        this.createdAt = workArea.getCreatedAt();
    }
}
