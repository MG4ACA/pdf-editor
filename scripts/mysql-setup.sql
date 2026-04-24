-- MySQL setup script
-- Run once as the root user:  mysql -u root -p < scripts/mysql-setup.sql

CREATE DATABASE IF NOT EXISTS pdf_editor
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Dedicated application user – minimal privileges
CREATE USER IF NOT EXISTS 'pdf_editor_user'@'localhost'
  IDENTIFIED BY 'change_me_strong_password';

GRANT SELECT, INSERT ON pdf_editor.*
  TO 'pdf_editor_user'@'localhost';

FLUSH PRIVILEGES;

-- The table is created automatically on first server startup via testConnection().
-- Alternatively create it manually:
USE pdf_editor;

CREATE TABLE IF NOT EXISTS edit_events (
  id          BIGINT       UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  action      VARCHAR(64)  NOT NULL,
  masked_ip   VARCHAR(20)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action     (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
