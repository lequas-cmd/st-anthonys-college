USE saint_anthonys_college;

-- Additive schema changes for dashboards, audit log, role permissions, and operational features.
-- Safe to run in phpMyAdmin on an existing database.

CREATE TABLE IF NOT EXISTS departments (
  department_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(30) NOT NULL,
  head_staff_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (department_id),
  UNIQUE KEY uq_departments_code (code),
  UNIQUE KEY uq_departments_name (name),
  KEY idx_departments_head_staff (head_staff_id),
  CONSTRAINT fk_departments_head_staff FOREIGN KEY (head_staff_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  permission_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(30) NOT NULL,
  resource VARCHAR(80) NOT NULL,
  action VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (permission_id),
  UNIQUE KEY uq_role_permissions (role_name, resource, action),
  KEY idx_role_permissions_role (role_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_sessions (
  session_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  login_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logout_at DATETIME NULL,
  revoked_at DATETIME NULL,
  PRIMARY KEY (session_id),
  KEY idx_user_sessions_user (user_id),
  KEY idx_user_sessions_login (login_at),
  CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_user_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (audit_id),
  KEY idx_audit_logs_actor (actor_user_id),
  KEY idx_audit_logs_user (user_id),
  KEY idx_audit_logs_action (action),
  KEY idx_audit_logs_created (created_at),
  CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS staff_leave_requests (
  leave_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  staff_id BIGINT UNSIGNED NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  reason TEXT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  PRIMARY KEY (leave_id),
  KEY idx_leave_staff (staff_id),
  KEY idx_leave_status (status),
  CONSTRAINT fk_staff_leave_staff FOREIGN KEY (staff_id) REFERENCES teachers(id) ON DELETE CASCADE,
  CONSTRAINT fk_staff_leave_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS grade_publish_events (
  event_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_id BIGINT UNSIGNED NOT NULL,
  teacher_id BIGINT UNSIGNED NOT NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  semester_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  PRIMARY KEY (event_id),
  KEY idx_grade_publish_course (course_id),
  KEY idx_grade_publish_teacher (teacher_id),
  KEY idx_grade_publish_semester (semester_id),
  CONSTRAINT fk_grade_publish_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_grade_publish_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  CONSTRAINT fk_grade_publish_semester FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS academic_calendar_events (
  event_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  event_type VARCHAR(60) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  location VARCHAR(120) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  KEY idx_academic_calendar_dates (starts_at, ends_at),
  CONSTRAINT fk_academic_calendar_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_import_batches (
  batch_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  imported_by BIGINT UNSIGNED NOT NULL,
  source_file VARCHAR(255) NULL,
  total_rows INT UNSIGNED NOT NULL DEFAULT 0,
  imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (batch_id),
  KEY idx_student_import_batches_user (imported_by),
  CONSTRAINT fk_student_import_batches_user FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_import_errors (
  error_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  batch_id BIGINT UNSIGNED NOT NULL,
  row_number INT UNSIGNED NOT NULL,
  error_message VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (error_id),
  KEY idx_student_import_errors_batch (batch_id),
  CONSTRAINT fk_student_import_errors_batch FOREIGN KEY (batch_id) REFERENCES student_import_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_templates (
  template_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  template_name VARCHAR(120) NOT NULL,
  template_type VARCHAR(40) NOT NULL,
  body_html MEDIUMTEXT NULL,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (template_id),
  UNIQUE KEY uq_document_templates_name (template_name),
  KEY idx_document_templates_type (template_type),
  CONSTRAINT fk_document_templates_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS classroom_resources (
  resource_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  classroom_id BIGINT UNSIGNED NULL,
  resource_type VARCHAR(60) NOT NULL,
  name VARCHAR(150) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('available','in_use','maintenance','lost') NOT NULL DEFAULT 'available',
  PRIMARY KEY (resource_id),
  KEY idx_classroom_resources_classroom (classroom_id),
  KEY idx_classroom_resources_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS timetable_room_assignments (
  assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  timetable_slot_id BIGINT UNSIGNED NOT NULL,
  room_id BIGINT UNSIGNED NULL,
  assigned_by BIGINT UNSIGNED NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (assignment_id),
  UNIQUE KEY uq_timetable_room_assignments (timetable_slot_id, room_id),
  KEY idx_timetable_room_assignments_slot (timetable_slot_id),
  CONSTRAINT fk_timetable_room_slot FOREIGN KEY (timetable_slot_id) REFERENCES timetable_entries(id) ON DELETE CASCADE,
  CONSTRAINT fk_timetable_room_assignee FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_documents (
  document_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('id_card','enrollment_letter','transcript','certificate','other') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NULL,
  generated_by BIGINT UNSIGNED NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (document_id),
  KEY idx_student_documents_student (student_id),
  KEY idx_student_documents_type (document_type),
  CONSTRAINT fk_student_documents_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_documents_user FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS grade_lock_history (
  lock_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  grade_id BIGINT UNSIGNED NOT NULL,
  locked_by BIGINT UNSIGNED NOT NULL,
  locked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255) NULL,
  PRIMARY KEY (lock_id),
  KEY idx_grade_lock_history_grade (grade_id),
  KEY idx_grade_lock_history_locked_by (locked_by),
  CONSTRAINT fk_grade_lock_history_grade FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
  CONSTRAINT fk_grade_lock_history_user FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Add missing columns if they are not present yet.
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS program_id BIGINT UNSIGNED NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender ENUM('female','male','other','undisclosed') NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(190) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address VARCHAR(255) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status ENUM('active','graduated','suspended','withdrawn') NOT NULL DEFAULT 'active';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS email VARCHAR(190) NULL;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS hire_date DATE NULL;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS status ENUM('active','inactive','on_leave') NOT NULL DEFAULT 'active';
ALTER TABLE grades ADD COLUMN IF NOT EXISTS locked_at DATETIME NULL;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS department_id BIGINT UNSIGNED NULL;

-- Add foreign keys if they do not exist.
SET @fk_exists := (SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE table_schema = DATABASE()
    AND table_name = 'students'
    AND constraint_name = 'fk_students_program');

SET @sql := IF(@fk_exists = 0,
  'ALTER TABLE students ADD CONSTRAINT fk_students_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_ann_exists := (SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE table_schema = DATABASE()
    AND table_name = 'announcements'
    AND constraint_name = 'fk_announcements_department');

SET @ann_sql := IF(@fk_ann_exists = 0,
  'ALTER TABLE announcements ADD CONSTRAINT fk_announcements_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL',
  'SELECT 1');

PREPARE ann_stmt FROM @ann_sql;
EXECUTE ann_stmt;
DEALLOCATE PREPARE ann_stmt;

-- Seed roles and baseline records.
INSERT INTO role_permissions (role_name, resource, action)
VALUES
  ('admin', 'students', 'create'),
  ('admin', 'students', 'delete'),
  ('admin', 'teachers', 'create'),
  ('admin', 'teachers', 'delete'),
  ('admin', 'programs', 'create'),
  ('admin', 'programs', 'delete'),
  ('admin', 'grades', 'update'),
  ('admin', 'grades', 'delete'),
  ('teacher', 'grades', 'update'),
  ('teacher', 'grades', 'delete'),
  ('teacher', 'attendance', 'update')
ON DUPLICATE KEY UPDATE resource = VALUES(resource), action = VALUES(action);

INSERT INTO departments (name, code, head_staff_id)
VALUES
  ('Academic Affairs', 'ACA', NULL),
  ('Information Technology', 'IT', NULL),
  ('Engineering', 'ENG', NULL),
  ('Business Studies', 'BUS', NULL),
  ('Hospitality', 'HOS', NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name), code = VALUES(code);

INSERT INTO document_templates (template_name, template_type, body_html, updated_by)
VALUES
  ('Student Welcome Letter', 'student_welcome', '<p>Welcome to Saint Anthony’s College.</p>', NULL)
ON DUPLICATE KEY UPDATE body_html = VALUES(body_html);

INSERT INTO academic_calendar_events (title, event_type, starts_at, ends_at, location, created_by)
VALUES
  ('Orientation Week', 'orientation', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Main Hall', NULL)
ON DUPLICATE KEY UPDATE location = VALUES(location);

INSERT INTO classroom_resources (classroom_id, resource_type, name, quantity, status)
VALUES
  (NULL, 'projector', 'HD Projector', 4, 'available'),
  (NULL, 'speaker', 'Portable Speaker', 2, 'available')
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), status = VALUES(status);

INSERT INTO staff_leave_requests (staff_id, leave_type, start_date, end_date, status, reason)
SELECT t.id, 'annual', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'pending', 'Medical checks and study leave'
FROM teachers t
LIMIT 1
ON DUPLICATE KEY UPDATE reason = VALUES(reason);

-- Simple demo login audit event.
INSERT INTO audit_logs (actor_user_id, user_id, action, entity_type, entity_id, details)
SELECT u.id, u.id, 'seed_run', 'system', 1, '{"source":"phpmyadmin","note":"Initial operational baseline created."}'
FROM users u
WHERE u.role = 'admin'
LIMIT 1
ON DUPLICATE KEY UPDATE details = VALUES(details);
