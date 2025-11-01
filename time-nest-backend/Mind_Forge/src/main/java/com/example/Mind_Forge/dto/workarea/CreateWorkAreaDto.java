package com.example.Mind_Forge.dto.workarea;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class CreateWorkAreaDto {
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double radiusMeters;
}
