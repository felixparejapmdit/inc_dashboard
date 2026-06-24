-- ============================================================
-- Daily Activity Report (DAR) Tables Migration (No-Fail Version)
-- Run this script against your `ppi` database.
-- ============================================================

-- 1. categories
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` INT NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(50) NOT NULL,
  `color_hex`    VARCHAR(7)  NULL COMMENT 'Hex color code for UI',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default categories
INSERT IGNORE INTO `categories` (`category_name`, `color_hex`) VALUES
  ('Worship Service',     '#7C3AED'),
  ('Office Task',         '#2563EB'),
  ('Outside Office Task', '#D97706'),
  ('Personal Task',       '#059669');

-- 2. tasks
CREATE TABLE IF NOT EXISTS `tasks` (
  `task_id`     INT          NOT NULL AUTO_INCREMENT,
  `user_id`     INT(11)      NOT NULL, -- Keeps index for application performance
  `category_id` INT          NOT NULL,
  `title`       VARCHAR(100) NOT NULL,
  `description` TEXT         NULL,
  `local_congregations` TEXT  NULL COMMENT 'Local congregation(s) served for worship service tasks',
  `task_date`   DATE         NOT NULL,
  `start_time`  TIME         NULL,
  `end_time`    TIME         NULL,
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'Active' COMMENT 'Active | Complete | Check',
  `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`),
  KEY `idx_tasks_user_id`     (`user_id`),
  KEY `idx_tasks_category_id` (`category_id`),
  KEY `idx_tasks_task_date`   (`task_date`),
  -- We link explicitly to categories since they were created together above
  CONSTRAINT `fk_tasks_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. accomplished_logs
CREATE TABLE IF NOT EXISTS `accomplished_logs` (
  `log_id`         INT           NOT NULL AUTO_INCREMENT,
  `task_id`        INT           NOT NULL,
  `completed_time` TIME          NULL    COMMENT 'Clock-in time or explicit timestamp of completion',
  `hours_rendered` DECIMAL(4,2)  NOT NULL DEFAULT 0.00 COMMENT 'Exact duration spent on the task',
  `created_at`     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_logs_task_id` (`task_id`),
  CONSTRAINT `fk_logs_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. daily_activity_reports
CREATE TABLE IF NOT EXISTS `daily_activity_reports` (
  `report_id`          INT      NOT NULL AUTO_INCREMENT,
  `user_id`            INT(11)  NOT NULL, 
  `report_date`        DATE     NOT NULL COMMENT 'Day mapped to the entry',
  `accomplishments`    TEXT     NULL     COMMENT 'Natapus na Gawain',
  `remarks`            TEXT     NULL     COMMENT 'System or administrative remarks',
  `personnel_remarks`  TEXT     NULL     COMMENT 'Remarks ng Personnel',
  `created_at`         DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `idx_dar_user_id`    (`user_id`),
  KEY `idx_dar_report_date`(`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Daily Activity Report tables created successfully!' AS Status;
