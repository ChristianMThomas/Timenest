package com.example.Mind_Forge.repository;

import com.example.Mind_Forge.model.ShiftViolationNotification;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftViolationNotificationRepository extends CrudRepository<ShiftViolationNotification, Long> {

    List<ShiftViolationNotification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    List<ShiftViolationNotification> findByTimeLog(TimeLog timeLog);

    Long countByUserAndIsReadFalse(User user);
}
