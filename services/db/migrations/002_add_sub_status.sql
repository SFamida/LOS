-- Migration: Add sub_status column to applications table
-- Run this if the applications table already exists

-- SQL Server
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('applications') AND name = 'sub_status'
)
BEGIN
    ALTER TABLE applications ADD sub_status VARCHAR(100) DEFAULT 'pending with lender';
    -- Backfill existing pending rows
    UPDATE applications SET sub_status = 'pending with lender' WHERE status = 'pending' AND sub_status IS NULL;
    PRINT 'Added sub_status column to applications table.';
END
GO
