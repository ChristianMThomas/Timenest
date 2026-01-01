package com.example.Mind_Forge.config;

import com.example.Mind_Forge.service.ShiftMonitoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class ScheduledTasksConfiguration {

    private final ShiftMonitoringService shiftMonitoringService;
    private static final Logger log = LoggerFactory.getLogger(ScheduledTasksConfiguration.class);

    public ScheduledTasksConfiguration(ShiftMonitoringService shiftMonitoringService) {
        this.shiftMonitoringService = shiftMonitoringService;
    }

    // Run every 5 minutes (300,000 milliseconds)
    // Initial delay of 1 minute to allow app to fully start up
    @Scheduled(fixedRate = 300000, initialDelay = 60000)
    public void monitorActiveShifts() {
        log.info("Executing scheduled shift monitoring task");
        try {
            shiftMonitoringService.checkAllActiveShifts();
        } catch (Exception e) {
            log.error("Error in scheduled shift monitoring", e);
        }
    }
}
