package com.example.Mind_Forge.controller;

import com.example.Mind_Forge.dto.workarea.CreateWorkAreaDto;
import com.example.Mind_Forge.dto.workarea.UpdateWorkAreaDto;
import com.example.Mind_Forge.dto.workarea.WorkAreaResponseDto;
import com.example.Mind_Forge.model.WorkArea;
import com.example.Mind_Forge.service.WorkAreaService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/workareas")
public class WorkAreaController {

    private final WorkAreaService workAreaService;
    private static final Logger log = LoggerFactory.getLogger(WorkAreaController.class);

    public WorkAreaController(WorkAreaService workAreaService) {
        this.workAreaService = workAreaService;
    }

    /**
     * Create a new work area (executives only)
     */
    @PostMapping
    @PreAuthorize("hasRole('EXECUTIVE')")
    public ResponseEntity<WorkAreaResponseDto> createWorkArea(@RequestBody CreateWorkAreaDto dto) {
        log.info("Received request to create work area: {}", dto.getName());

        WorkArea created = workAreaService.createWorkArea(
                dto.getName(),
                dto.getAddress(),
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getRadiusMeters());

        return ResponseEntity.ok(new WorkAreaResponseDto(created));
    }

    /**
     * Get all work areas for the authenticated user's company
     */
    @GetMapping
    public ResponseEntity<List<WorkAreaResponseDto>> getAllWorkAreas() {
        log.info("Received request to get all work areas");

        List<WorkArea> workAreas = workAreaService.getAllWorkAreas();
        List<WorkAreaResponseDto> response = workAreas.stream()
                .map(WorkAreaResponseDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get only active work areas for the authenticated user's company
     */
    @GetMapping("/active")
    public ResponseEntity<List<WorkAreaResponseDto>> getActiveWorkAreas() {
        log.info("Received request to get active work areas");

        List<WorkArea> workAreas = workAreaService.getActiveWorkAreas();
        List<WorkAreaResponseDto> response = workAreas.stream()
                .map(WorkAreaResponseDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific work area by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkAreaResponseDto> getWorkAreaById(@PathVariable Long id) {
        log.info("Received request to get work area with ID: {}", id);

        WorkArea workArea = workAreaService.getWorkAreaById(id);
        return ResponseEntity.ok(new WorkAreaResponseDto(workArea));
    }

    /**
     * Update a work area (executives only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EXECUTIVE')")
    public ResponseEntity<WorkAreaResponseDto> updateWorkArea(
            @PathVariable Long id,
            @RequestBody UpdateWorkAreaDto dto) {
        log.info("Received request to update work area with ID: {}", id);

        WorkArea updated = workAreaService.updateWorkArea(
                id,
                dto.getName(),
                dto.getAddress(),
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getRadiusMeters(),
                dto.getActive());

        return ResponseEntity.ok(new WorkAreaResponseDto(updated));
    }

    /**
     * Permanently delete a work area (executives only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EXECUTIVE')")
    public ResponseEntity<Void> deleteWorkArea(@PathVariable Long id) {
        log.info("Received request to permanently delete work area with ID: {}", id);

        workAreaService.deleteWorkArea(id);
        return ResponseEntity.noContent().build();
    }
}
