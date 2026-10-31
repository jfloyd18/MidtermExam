-- Student Records database
-- Run this in phpMyAdmin (SQL tab) or the MySQL CLI.

CREATE DATABASE IF NOT EXISTS student_records CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_records;

DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(20)  NOT NULL UNIQUE,
    first_name     VARCHAR(60)  NOT NULL,
    last_name      VARCHAR(60)  NOT NULL,
    course         VARCHAR(80)  NOT NULL,
    year_level     TINYINT      NOT NULL,
    email          VARCHAR(120) NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample records so the list isn't empty on first launch
INSERT INTO students (student_number, first_name, last_name, course, year_level, email) VALUES
('2023-00101', 'Maria',  'Santos',    'BS Information Technology', 3, 'maria.santos@example.com'),
('2023-00102', 'Juan',   'Dela Cruz', 'BS Computer Science',       3, 'juan.delacruz@example.com'),
('2024-00215', 'Angela', 'Reyes',     'BS Information Systems',    2, 'angela.reyes@example.com'),
('2022-00330', 'Mark',   'Villanueva','BS Information Technology', 4, 'mark.villanueva@example.com'),
('2025-00412', 'Kristine','Bautista', 'BS Computer Science',       1, 'kristine.bautista@example.com');
