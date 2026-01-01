-- Migration: Add performance indexes for TimeNest optimization
-- Date: 2026-01-01
-- Purpose: Reduce database query times and improve application performance

-- TimeLog table indexes
-- Check if indexes exist before creating (PostgreSQL syntax)
DO $$
BEGIN
    -- Index for active shift queries
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'timelogs'
        AND indexname = 'idx_active_shift'
    ) THEN
        CREATE INDEX idx_active_shift ON timelogs(is_active_shift);
    END IF;

    -- Index for location check queries
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'timelogs'
        AND indexname = 'idx_last_location_check'
    ) THEN
        CREATE INDEX idx_last_location_check ON timelogs(last_location_check);
    END IF;

    -- Composite index for user + active shift lookups
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'timelogs'
        AND indexname = 'idx_user_active_shift'
    ) THEN
        CREATE INDEX idx_user_active_shift ON timelogs(user_id, is_active_shift);
    END IF;
END $$;

-- User table indexes
DO $$
BEGIN
    -- Index for email lookups (login)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'users'
        AND indexname = 'idx_email'
    ) THEN
        CREATE INDEX idx_email ON users(email);
    END IF;

    -- Composite index for company + role queries (executive notifications)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'users'
        AND indexname = 'idx_company_role'
    ) THEN
        CREATE INDEX idx_company_role ON users(company_id, role);
    END IF;
END $$;

-- Verify indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('timelogs', 'users')
ORDER BY tablename, indexname;
