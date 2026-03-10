-- Add archived column to bookings table for soft-delete functionality
-- Run: mysql -u seventrip_user -p seventrip < backend/database/archive-migration.sql

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'archived');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE bookings ADD COLUMN archived TINYINT(1) DEFAULT 0', 
  'SELECT "Column archived already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
