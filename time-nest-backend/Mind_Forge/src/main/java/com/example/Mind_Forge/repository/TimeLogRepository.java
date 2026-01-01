package com.example.Mind_Forge.repository;

import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.model.User;
import com.example.Mind_Forge.model.WorkArea;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeLogRepository extends CrudRepository<TimeLog, Long> {

    /*
     * - Spring sees findBy_() and auto-generates a query like
     * - SELECT * FROM users WHERE _ = ?
     */

    List<TimeLog> findByUser(User user);

    List<TimeLog> findByLocation(String location);

    List<TimeLog> findByCompany(Company company);

    List<TimeLog> findByWorkArea(WorkArea workArea);

    // Shift monitoring queries
    List<TimeLog> findByIsActiveShiftTrue();

    Optional<TimeLog> findByUserAndIsActiveShiftTrue(User user);

    @Query("SELECT t FROM TimeLog t " +
           "LEFT JOIN FETCH t.user u " +
           "LEFT JOIN FETCH u.company " +
           "LEFT JOIN FETCH t.workArea " +
           "WHERE t.isActiveShift = true AND " +
           "(t.lastLocationCheck IS NULL OR t.lastLocationCheck < :thresholdTime)")
    List<TimeLog> findActiveShiftsNeedingCheck(@Param("thresholdTime") LocalDateTime thresholdTime);
}