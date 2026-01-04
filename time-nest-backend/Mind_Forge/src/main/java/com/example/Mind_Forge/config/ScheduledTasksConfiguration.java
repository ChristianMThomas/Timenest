package com.example.Mind_Forge.config;

import com.example.Mind_Forge.service.ShiftMonitoringService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;

@Configuration
@EnableScheduling
public class ScheduledTasksConfiguration {

    private final ShiftMonitoringService shiftMonitoringService;
    private static final Logger log = LoggerFactory.getLogger(ScheduledTasksConfiguration.class);

    public ScheduledTasksConfiguration(ShiftMonitoringService shiftMonitoringService) {
        this.shiftMonitoringService = shiftMonitoringService;
    }

    @PostConstruct
    public void init() {
        log.info("========================================");
        log.info("SCHEDULED TASKS CONFIGURATION LOADED");
        log.info("Shift monitoring will run every 5 minutes");
        log.info("Initial delay: 60 seconds");
        log.info("========================================");
    }

    // Run every 5 minutes (300,000 milliseconds)
    // Initial delay of 1 minute to allow app to fully start up
    @Scheduled(fixedRate = 300000, initialDelay = 60000)
    public void monitorActiveShifts() {
        log.info("========================================");
        log.info("SCHEDULED TASK TRIGGERED at {}", LocalDateTime.now());
        log.info("========================================");
        try {
            shiftMonitoringService.checkAllActiveShifts();
            log.info("Scheduled shift monitoring task completed successfully");
        } catch (Exception e) {
            log.error("CRITICAL ERROR in scheduled shift monitoring", e);
        }
    }
}
