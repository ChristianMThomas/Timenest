-- Migration: Add performance indexes for TimeNest optimization (MySQL/MariaDB version)
-- Date: 2026-01-01
-- Purpose: Reduce database query times and improve application performance

-- TimeLog table indexes
-- MySQL automatically skips if index already exists with IF NOT EXISTS clause
CREATE INDEX IF NOT EXISTS idx_active_shift
ON timelogs(is_active_shift);

CREATE INDEX IF NOT EXISTS idx_last_location_check
ON timelogs(last_location_check);

CREATE INDEX IF NOT EXISTS idx_user_active_shift
ON timelogs(user_id, is_active_shift);

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_company_role
ON users(company_id, role);

-- Verify indexes were created
SHOW INDEX FROM timelogs;
SHOW INDEX FROM users;
