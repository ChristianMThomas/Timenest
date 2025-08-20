package com.example.Mind_Forge.repository;

import com.example.Mind_Forge.model.Company;
import com.example.Mind_Forge.model.TimeLog;
import com.example.Mind_Forge.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeLogRepository extends CrudRepository<TimeLog, Long> {

    /*
     * - Spring sees findBy_() and auto-generates a query like
     * - SELECT * FROM users WHERE _ = ?
     */

    List<TimeLog> findByUser(User user);

    List<TimeLog> findByLocation(String location);

    List<TimeLog> findByCompany(Company company);
}