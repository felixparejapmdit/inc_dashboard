-- Face Recognition Tables Migration
-- This migration adds optional face recognition functionality
-- Run this script to create the necessary tables

-- Table: face_recognition
-- Stores face descriptors for personnel who opt-in to face recognition login
CREATE TABLE IF NOT EXISTS `face_recognition` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `personnel_id` BIGINT(20) NOT NULL,
  `face_descriptor` LONGTEXT NOT NULL COMMENT 'Face descriptor array from face-api.js',
  `is_enabled` TINYINT(1) DEFAULT 1 COMMENT 'Whether face recognition login is enabled for this user',
  `enrolled_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` DATETIME NULL COMMENT 'Last time face recognition was used for login',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_personnel_id` (`personnel_id`),
  CONSTRAINT `fk_face_recognition_personnel` 
    FOREIGN KEY (`personnel_id`) 
    REFERENCES `personnels` (`personnel_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: face_recognition_logs
-- Audit log for all face recognition attempts
CREATE TABLE IF NOT EXISTS `face_recognition_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `personnel_id` BIGINT(20) NOT NULL,
  `action` ENUM('login', 'attendance', 'verification', 'enrollment', 'update') NOT NULL COMMENT 'Type of action performed',
  `confidence_score` FLOAT NULL COMMENT 'Confidence score of face match (0-1)',
  `success` TINYINT(1) DEFAULT 0 COMMENT 'Whether the action was successful',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `error_message` TEXT NULL COMMENT 'Error message if action failed',
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_personnel_id` (`personnel_id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_action` (`action`),
  CONSTRAINT `fk_face_recognition_logs_personnel` 
    FOREIGN KEY (`personnel_id`) 
    REFERENCES `personnels` (`personnel_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX `idx_is_enabled` ON `face_recognition` (`is_enabled`);
CREATE INDEX `idx_enrolled_at` ON `face_recognition` (`enrolled_at`);

-- Success message
SELECT 'Face Recognition tables created successfully!' AS Status;
