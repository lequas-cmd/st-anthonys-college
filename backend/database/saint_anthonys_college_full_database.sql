-- Saint Anthony's Technical and Vocational College
-- MySQL 8 / MariaDB compatible starter schema + demonstration data.
-- BACK UP YOUR DATABASE BEFORE IMPORTING. This script does not DROP existing tables.
-- Demo password_hash values are intentionally unusable placeholders; create real hashes via the backend.

CREATE DATABASE IF NOT EXISTS saint_anthonys_college CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saint_anthonys_college;
SET NAMES utf8mb4;

-- CORE IDENTITY TABLES (column names remain compatible with the existing backend)
CREATE TABLE IF NOT EXISTS users (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 username VARCHAR(100) NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 role ENUM('admin','teacher','student') NOT NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 last_login_at DATETIME NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(id), UNIQUE KEY uq_users_username(username), KEY idx_users_role_active(role,is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS programs (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 code VARCHAR(30) NOT NULL UNIQUE, name VARCHAR(150) NOT NULL UNIQUE,
 department VARCHAR(150) NULL, qualification_level VARCHAR(80) NOT NULL DEFAULT 'Level I',
 duration_years TINYINT UNSIGNED NOT NULL DEFAULT 2, description TEXT NULL,
 image_url VARCHAR(500) NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

ALTER TABLE programs ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL;

CREATE TABLE IF NOT EXISTS students (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 user_id BIGINT UNSIGNED NOT NULL,
 student_number VARCHAR(50) NOT NULL,
 first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
 program VARCHAR(150) NULL, enrollment_year SMALLINT UNSIGNED NULL,
 program_id BIGINT UNSIGNED NULL, date_of_birth DATE NULL, gender ENUM('female','male','other','undisclosed') NULL,
 phone VARCHAR(30) NULL, email VARCHAR(190) NULL, address VARCHAR(255) NULL,
 status ENUM('active','graduated','suspended','withdrawn') NOT NULL DEFAULT 'active',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(id), UNIQUE KEY uq_students_user(user_id), UNIQUE KEY uq_students_number(student_number),
 KEY idx_students_program(program_id), CONSTRAINT fk_students_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 CONSTRAINT fk_students_program FOREIGN KEY(program_id) REFERENCES programs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teachers (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 user_id BIGINT UNSIGNED NOT NULL, employee_number VARCHAR(50) NOT NULL,
 first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
 department VARCHAR(150) NULL, phone VARCHAR(30) NULL, email VARCHAR(190) NULL,
 hire_date DATE NULL, status ENUM('active','inactive','on_leave') NOT NULL DEFAULT 'active',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(id), UNIQUE KEY uq_teachers_user(user_id), UNIQUE KEY uq_teachers_number(employee_number),
 CONSTRAINT fk_teachers_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- If users/students/teachers already existed from the earlier starter schema, add the newer optional fields.
-- XAMPP's current MariaDB versions support ADD COLUMN IF NOT EXISTS.
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

CREATE TABLE IF NOT EXISTS academic_years (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(30) NOT NULL UNIQUE,
 starts_on DATE NOT NULL, ends_on DATE NOT NULL, is_current TINYINT(1) NOT NULL DEFAULT 0,
 CHECK(ends_on > starts_on)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS semesters (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, academic_year_id BIGINT UNSIGNED NOT NULL,
 name VARCHAR(50) NOT NULL, starts_on DATE NOT NULL, ends_on DATE NOT NULL,
 is_current TINYINT(1) NOT NULL DEFAULT 0, UNIQUE KEY uq_semester_year_name(academic_year_id,name),
 FOREIGN KEY(academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
 CHECK(ends_on > starts_on)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS courses (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(30) NOT NULL UNIQUE,
 title VARCHAR(180) NOT NULL, description TEXT NULL, credit_hours TINYINT UNSIGNED NOT NULL DEFAULT 3,
 program_id BIGINT UNSIGNED NULL, level_number TINYINT UNSIGNED NOT NULL DEFAULT 1,
 is_active TINYINT(1) NOT NULL DEFAULT 1, FOREIGN KEY(program_id) REFERENCES programs(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS course_offerings (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, course_id BIGINT UNSIGNED NOT NULL,
 teacher_id BIGINT UNSIGNED NOT NULL, semester_id BIGINT UNSIGNED NOT NULL,
 section VARCHAR(20) NOT NULL DEFAULT 'A', room VARCHAR(50) NULL, capacity SMALLINT UNSIGNED NOT NULL DEFAULT 40,
 status ENUM('planned','open','completed','cancelled') NOT NULL DEFAULT 'open',
 UNIQUE KEY uq_offering(course_id,teacher_id,semester_id,section),
 FOREIGN KEY(course_id) REFERENCES courses(id), FOREIGN KEY(teacher_id) REFERENCES teachers(id),
 FOREIGN KEY(semester_id) REFERENCES semesters(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS enrollments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id BIGINT UNSIGNED NOT NULL,
 offering_id BIGINT UNSIGNED NOT NULL, enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 status ENUM('enrolled','completed','withdrawn') NOT NULL DEFAULT 'enrolled',
 UNIQUE KEY uq_student_offering(student_id,offering_id),
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
 FOREIGN KEY(offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TIMETABLE, ATTENDANCE, ASSESSMENT AND GRADING
CREATE TABLE IF NOT EXISTS timetable_entries (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, offering_id BIGINT UNSIGNED NOT NULL,
 weekday TINYINT UNSIGNED NOT NULL COMMENT '1=Monday ... 7=Sunday', starts_at TIME NOT NULL, ends_at TIME NOT NULL,
 room VARCHAR(50) NULL, FOREIGN KEY(offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
 CHECK(weekday BETWEEN 1 AND 7), CHECK(ends_at > starts_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS attendance_sessions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, offering_id BIGINT UNSIGNED NOT NULL,
 session_date DATE NOT NULL, topic VARCHAR(180) NULL, recorded_by BIGINT UNSIGNED NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_attendance_session(offering_id,session_date),
 FOREIGN KEY(offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
 FOREIGN KEY(recorded_by) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS attendance_records (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, session_id BIGINT UNSIGNED NOT NULL,
 student_id BIGINT UNSIGNED NOT NULL,
 status ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present', note VARCHAR(255) NULL,
 marked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_session_student(session_id,student_id),
 FOREIGN KEY(session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS assessments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, offering_id BIGINT UNSIGNED NOT NULL,
 title VARCHAR(180) NOT NULL, assessment_type ENUM('test','project','midterm','final','practical','quiz','other') NOT NULL,
 max_score DECIMAL(6,2) NOT NULL DEFAULT 100, weight_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
 due_date DATETIME NULL, published TINYINT(1) NOT NULL DEFAULT 0,
 FOREIGN KEY(offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
 CHECK(max_score > 0), CHECK(weight_percent >= 0 AND weight_percent <= 100)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS grades (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, assessment_id BIGINT UNSIGNED NOT NULL,
 student_id BIGINT UNSIGNED NOT NULL, score DECIMAL(6,2) NULL, feedback TEXT NULL,
 graded_by BIGINT UNSIGNED NULL, graded_at DATETIME NULL, published TINYINT(1) NOT NULL DEFAULT 0,
 UNIQUE KEY uq_assessment_student(assessment_id,student_id),
 FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
 FOREIGN KEY(graded_by) REFERENCES teachers(id) ON DELETE SET NULL,
 CHECK(score IS NULL OR score >= 0)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS assignment_submissions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, assessment_id BIGINT UNSIGNED NOT NULL,
 student_id BIGINT UNSIGNED NOT NULL, submission_text TEXT NULL, file_url VARCHAR(500) NULL,
 submitted_at DATETIME NULL, status ENUM('draft','submitted','late','graded','returned') NOT NULL DEFAULT 'draft',
 UNIQUE KEY uq_submission(assessment_id,student_id),
 FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- PUBLIC WEBSITE CONTENT AND STUDENT COMMUNICATION
CREATE TABLE IF NOT EXISTS announcements (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, body TEXT NOT NULL,
 audience ENUM('everyone','students','teachers','staff') NOT NULL DEFAULT 'everyone',
 status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
 published_at DATETIME NULL, expires_at DATETIME NULL, created_by BIGINT UNSIGNED NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL, KEY idx_announcement_status(status,published_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS announcement_reads (
 announcement_id BIGINT UNSIGNED NOT NULL, user_id BIGINT UNSIGNED NOT NULL, read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(announcement_id,user_id), FOREIGN KEY(announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS assignments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, offering_id BIGINT UNSIGNED NOT NULL,
 title VARCHAR(180) NOT NULL, instructions TEXT NULL, due_at DATETIME NULL,
 max_score DECIMAL(6,2) NOT NULL DEFAULT 100, attachment_url VARCHAR(500) NULL,
 status ENUM('draft','published','closed') NOT NULL DEFAULT 'draft', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS resources (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(180) NOT NULL, description TEXT NULL,
 category ENUM('form','calendar','policy','learning_material','student_guide','other') NOT NULL DEFAULT 'other',
 file_url VARCHAR(500) NULL, audience ENUM('public','students','teachers','staff') NOT NULL DEFAULT 'public',
 published TINYINT(1) NOT NULL DEFAULT 1, uploaded_by BIGINT UNSIGNED NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS notifications (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 title VARCHAR(180) NOT NULL, message TEXT NOT NULL, type ENUM('info','success','warning','urgent') NOT NULL DEFAULT 'info',
 link_url VARCHAR(500) NULL, read_at DATETIME NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, KEY idx_notification_user_read(user_id,read_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(180) NOT NULL, slug VARCHAR(200) NOT NULL UNIQUE,
 summary TEXT NULL, body MEDIUMTEXT NULL, location VARCHAR(180) NULL,
 starts_at DATETIME NOT NULL, ends_at DATETIME NULL, image_url VARCHAR(500) NULL,
 status ENUM('draft','published','cancelled') NOT NULL DEFAULT 'draft', created_by BIGINT UNSIGNED NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS news_articles (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, slug VARCHAR(220) NOT NULL UNIQUE,
 summary TEXT NULL, body MEDIUMTEXT NOT NULL, image_url VARCHAR(500) NULL,
 status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft', published_at DATETIME NULL,
 author_id BIGINT UNSIGNED NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS admissions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, application_number VARCHAR(40) NOT NULL UNIQUE,
 first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, date_of_birth DATE NULL,
 gender ENUM('female','male','other','undisclosed') NULL, phone VARCHAR(30) NOT NULL, email VARCHAR(190) NULL,
 address VARCHAR(255) NULL, program_id BIGINT UNSIGNED NOT NULL,
 previous_education VARCHAR(180) NULL, application_status ENUM('submitted','under_review','accepted','rejected','enrolled') NOT NULL DEFAULT 'submitted',
 submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, reviewed_by BIGINT UNSIGNED NULL, review_note TEXT NULL,
 FOREIGN KEY(program_id) REFERENCES programs(id), FOREIGN KEY(reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS site_settings (
 setting_key VARCHAR(100) PRIMARY KEY, setting_value TEXT NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS contact_messages (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(150) NOT NULL, email VARCHAR(190) NOT NULL,
 subject VARCHAR(180) NOT NULL, message TEXT NOT NULL, status ENUM('new','in_progress','resolved','spam') NOT NULL DEFAULT 'new',
 received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, handled_by BIGINT UNSIGNED NULL,
 FOREIGN KEY(handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- DEMO USERS. These password values are placeholders, not login-ready hashes.
INSERT INTO users(username,password_hash,role,is_active) VALUES
('demo_admin','NOT_A_REAL_HASH_use_backend_bcrypt','admin',1),
('demo_teacher01','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),('demo_teacher02','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),
('demo_teacher03','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),('demo_teacher04','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),
('demo_teacher05','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),('demo_teacher06','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),
('demo_teacher07','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),('demo_teacher08','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),
('demo_teacher09','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),('demo_teacher10','NOT_A_REAL_HASH_use_backend_bcrypt','teacher',1),
('demo_student01','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),('demo_student02','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),
('demo_student03','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),('demo_student04','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),
('demo_student05','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),('demo_student06','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),
('demo_student07','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),('demo_student08','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),
('demo_student09','NOT_A_REAL_HASH_use_backend_bcrypt','student',1),('demo_student10','NOT_A_REAL_HASH_use_backend_bcrypt','student',1)
ON DUPLICATE KEY UPDATE role=VALUES(role),is_active=1;

INSERT INTO programs(code,name,department,qualification_level,duration_years,description) VALUES
('ELI','Electrical Installation','Electrical Technology','Level I-IV',2,'Electrical installation, safety, testing and maintenance.'),
('ICT','Information Technology','ICT','Level I-IV',2,'Computer systems, networking, software and support.'),
('AUT','Automotive Technology','Automotive','Level I-IV',2,'Vehicle servicing, diagnostics and repair.'),
('CON','Construction Technology','Construction','Level I-IV',2,'Construction methods, materials and site practice.'),
('WLD','Welding Technology','Manufacturing','Level I-IV',2,'Workshop welding, fabrication and safety.'),
('PLB','Plumbing','Building Services','Level I-III',2,'Water supply, drainage and plumbing systems.'),
('REF','Refrigeration and Air Conditioning','Building Services','Level I-IV',2,'Cooling systems installation and maintenance.'),
('ACC','Accounting','Business','Level I-IV',2,'Bookkeeping, accounting software and reporting.'),
('MEC','General Mechanics','Manufacturing','Level I-IV',2,'Mechanical workshop and maintenance skills.'),
('HOT','Hospitality Operations','Hospitality','Level I-III',2,'Food service, customer care and hospitality practice.')
ON DUPLICATE KEY UPDATE department=VALUES(department),description=VALUES(description);

INSERT INTO academic_years(name,starts_on,ends_on,is_current) VALUES
('2026/2027','2026-09-01','2027-08-31',1),('2025/2026','2025-09-01','2026-08-31',0)
ON DUPLICATE KEY UPDATE is_current=VALUES(is_current);
INSERT INTO semesters(academic_year_id,name,starts_on,ends_on,is_current)
SELECT id,'Semester 1','2026-09-01','2027-01-31',1 FROM academic_years WHERE name='2026/2027'
ON DUPLICATE KEY UPDATE starts_on=VALUES(starts_on),ends_on=VALUES(ends_on),is_current=VALUES(is_current);
INSERT INTO semesters(academic_year_id,name,starts_on,ends_on,is_current)
SELECT id,'Semester 2','2027-02-01','2027-06-30',0 FROM academic_years WHERE name='2026/2027'
ON DUPLICATE KEY UPDATE starts_on=VALUES(starts_on),ends_on=VALUES(ends_on);

-- 10 teacher profiles
INSERT INTO teachers(user_id,employee_number,first_name,last_name,department,phone,email,hire_date)
SELECT u.id,CONCAT('EMP-',LPAD(n.n,3,'0')),n.first_name,n.last_name,n.department,CONCAT('+251911000',LPAD(n.n,3,'0')),CONCAT('teacher',LPAD(n.n,2,'0'),'@example.edu'),DATE_ADD('2020-09-01',INTERVAL n.n MONTH)
FROM users u JOIN (
 SELECT 1 n,'Daniel' first_name,'Kebede' last_name,'Electrical Technology' department UNION ALL SELECT 2,'Hana','Worku','ICT' UNION ALL SELECT 3,'Abebe','Tadesse','Automotive' UNION ALL SELECT 4,'Marta','Bekele','Construction' UNION ALL SELECT 5,'Samuel','Alemu','Manufacturing' UNION ALL SELECT 6,'Selam','Girma','Building Services' UNION ALL SELECT 7,'Dawit','Tesfaye','Business' UNION ALL SELECT 8,'Rahel','Mekonnen','Hospitality' UNION ALL SELECT 9,'Yonas','Haile','ICT' UNION ALL SELECT 10,'Liya','Solomon','Electrical Technology'
) n ON u.username=CONCAT('demo_teacher',LPAD(n.n,2,'0'))
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name),last_name=VALUES(last_name),department=VALUES(department);

-- 10 student profiles
INSERT INTO students(user_id,student_number,first_name,last_name,program,enrollment_year,program_id,gender,phone,email,status)
SELECT u.id,CONCAT('SA-',2026,'-',LPAD(n.n,4,'0')),n.first_name,n.last_name,n.program,2026,p.id,n.gender,CONCAT('+251922000',LPAD(n.n,3,'0')),CONCAT('student',LPAD(n.n,2,'0'),'@example.edu'),'active'
FROM users u JOIN (
 SELECT 1 n,'Abel' first_name,'Mekonnen' last_name,'Electrical Installation' program,'male' gender,'ELI' code UNION ALL SELECT 2,'Martha','Bekele','Information Technology','female','ICT' UNION ALL SELECT 3,'Dawit','Tesfaye','Automotive Technology','male','AUT' UNION ALL SELECT 4,'Sara','Alemu','Construction Technology','female','CON' UNION ALL SELECT 5,'Nahom','Girma','Welding Technology','male','WLD' UNION ALL SELECT 6,'Hana','Tadesse','Plumbing','female','PLB' UNION ALL SELECT 7,'Miki','Haile','Refrigeration and Air Conditioning','male','REF' UNION ALL SELECT 8,'Ruth','Solomon','Accounting','female','ACC' UNION ALL SELECT 9,'Bereket','Kebede','General Mechanics','male','MEC' UNION ALL SELECT 10,'Meron','Worku','Hospitality Operations','female','HOT'
) n JOIN programs p ON p.code=n.code ON u.username=CONCAT('demo_student',LPAD(n.n,2,'0'))
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name),last_name=VALUES(last_name),program=VALUES(program),program_id=VALUES(program_id);

-- 10 courses
INSERT INTO courses(code,title,description,credit_hours,program_id,level_number) VALUES
('ELI101','Electrical Safety and Tools','Workshop safety, electrical hazards and tool handling.',3,(SELECT id FROM programs WHERE code='ELI'),1),
('ELI102','Basic Wiring','Domestic wiring and installation practice.',4,(SELECT id FROM programs WHERE code='ELI'),1),
('ICT101','Computer Fundamentals','Computer hardware, operating systems and support.',3,(SELECT id FROM programs WHERE code='ICT'),1),
('ICT102','Networking Basics','LAN concepts, addressing and troubleshooting.',4,(SELECT id FROM programs WHERE code='ICT'),1),
('AUT101','Automotive Workshop Practice','Workshop tools, service routines and safety.',4,(SELECT id FROM programs WHERE code='AUT'),1),
('CON101','Construction Materials','Properties and use of common construction materials.',3,(SELECT id FROM programs WHERE code='CON'),1),
('WLD101','Welding Fundamentals','Welding processes, equipment and safety.',4,(SELECT id FROM programs WHERE code='WLD'),1),
('PLB101','Plumbing Fundamentals','Pipes, fittings, water supply and drainage.',3,(SELECT id FROM programs WHERE code='PLB'),1),
('ACC101','Basic Accounting','Transactions, journals, ledgers and trial balance.',3,(SELECT id FROM programs WHERE code='ACC'),1),
('MEC101','Mechanical Workshop Skills','Measurement, hand tools and maintenance practice.',4,(SELECT id FROM programs WHERE code='MEC'),1)
ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description);

-- Course offerings: one course, instructor and current semester each
INSERT INTO course_offerings(course_id,teacher_id,semester_id,section,room,capacity,status)
SELECT c.id,t.id,s.id,'A',CONCAT('Workshop ',LPAD(c.id,2,'0')),35,'open'
FROM courses c
JOIN teachers t ON t.id=(SELECT MIN(t2.id) FROM teachers t2)
JOIN semesters s ON s.name='Semester 1'
WHERE c.code IN ('ELI101','ELI102','ICT101','ICT102','AUT101','CON101','WLD101','PLB101','ACC101','MEC101')
AND NOT EXISTS(SELECT 1 FROM course_offerings o WHERE o.course_id=c.id AND o.semester_id=s.id AND o.section='A');

-- Enroll every demo student in the first two course offerings
INSERT IGNORE INTO enrollments (student_id, offering_id, status)
SELECT st.id, selected_offerings.id, 'enrolled'
FROM students AS st
CROSS JOIN (
    SELECT id
    FROM course_offerings
    ORDER BY id
    LIMIT 2
) AS selected_offerings
WHERE st.student_number LIKE 'SA-2026-%';

-- 10 assignments
INSERT INTO assignments(offering_id,title,instructions,due_at,max_score,status)
SELECT o.id, a.title,a.instructions,a.due_at,100,'published' FROM course_offerings o JOIN (
 SELECT 1 n,'Workshop safety checklist' title,'Submit a completed workshop safety checklist.' instructions,'2026-10-20 16:00:00' due_at UNION ALL SELECT 2,'Tools identification','Identify ten tools and explain their safe use.','2026-10-22 16:00:00' UNION ALL SELECT 3,'Practical exercise 1','Complete the assigned practical exercise and upload a short report.','2026-10-24 16:00:00' UNION ALL SELECT 4,'Module worksheet','Answer all questions in the module worksheet.','2026-10-26 16:00:00' UNION ALL SELECT 5,'Troubleshooting task','Document the steps used to diagnose the supplied fault.','2026-10-28 16:00:00' UNION ALL SELECT 6,'Individual project proposal','Submit a one-page proposal for your practical project.','2026-10-30 16:00:00' UNION ALL SELECT 7,'Practical report','Describe the process, tools and safety measures used.','2026-11-02 16:00:00' UNION ALL SELECT 8,'Mid-module review','Complete the revision questions for this module.','2026-11-04 16:00:00' UNION ALL SELECT 9,'Team demonstration','Prepare a brief demonstration with your assigned team.','2026-11-06 16:00:00' UNION ALL SELECT 10,'Final portfolio','Submit your module portfolio for review.','2026-11-10 16:00:00'
) a ON a.n=o.id
WHERE NOT EXISTS(SELECT 1 FROM assignments x WHERE x.offering_id=o.id AND x.title=a.title);

-- 10 announcements
INSERT INTO announcements(title,body,audience,status,published_at,created_by) VALUES
('Welcome to the 2026/2027 Academic Year','Welcome to the new academic year. Please check your timetable and meet your instructors.','everyone','published','2026-09-15 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Student Registration Reminder','Students should confirm their registration details with the registrar.','students','published','2026-09-16 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Workshop Safety Orientation','All students must attend workshop safety orientation before practical sessions.','students','published','2026-09-18 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Updated Class Timetable','The semester timetable is available from the academic office.','everyone','published','2026-09-20 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Assessment Schedule','Review the assessment dates and contact your instructor if there is a conflict.','students','published','2026-09-22 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Teaching Staff Meeting','Teaching staff meeting will be held in the academic office.','teachers','published','2026-09-24 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Library Resource Update','New learning materials have been added to the resource list.','everyone','published','2026-09-26 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Attendance Policy','Students are expected to attend all scheduled classes and practical sessions.','students','published','2026-09-28 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Admissions Enquiries','Prospective students may contact the admissions office for program information.','everyone','published','2026-10-01 09:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Mid-semester Assessment Schedule Published','Check the updated assessment calendar and confirm your examination dates.','students','published','2026-10-05 09:00:00',(SELECT id FROM users WHERE username='demo_admin'))
ON DUPLICATE KEY UPDATE body=VALUES(body),status=VALUES(status);

-- 10 attendance sessions and attendance records for demo students (one session per first offering/date)
INSERT INTO attendance_sessions(offering_id,session_date,topic,recorded_by)
SELECT o.id,DATE_ADD('2026-10-01',INTERVAL n.n DAY),CONCAT('Practical session ',n.n),(SELECT MIN(id) FROM teachers)
FROM course_offerings o JOIN (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) n
WHERE o.id=(SELECT MIN(id) FROM course_offerings)
ON DUPLICATE KEY UPDATE topic=VALUES(topic);
INSERT INTO attendance_records(session_id,student_id,status)
SELECT sess.id,st.id,CASE WHEN MOD(sess.id+st.id,10)=0 THEN 'late' WHEN MOD(sess.id+st.id,7)=0 THEN 'absent' ELSE 'present' END
FROM attendance_sessions sess JOIN students st ON st.student_number LIKE 'SA-2026-%'
WHERE sess.offering_id=(SELECT MIN(id) FROM course_offerings)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Assessments, grades and submissions for first offering and all demo students
INSERT INTO assessments(offering_id,title,assessment_type,max_score,weight_percent,due_date,published)
SELECT o.id,a.title,a.kind, a.max_score,a.weight,a.due,1 FROM course_offerings o JOIN (
 SELECT 'Test 1' title,'test' kind,100 max_score,10.00 weight,'2026-10-20 16:00:00' due UNION ALL
 SELECT 'Test 2','test',100,10.00,'2026-11-03 16:00:00' UNION ALL
 SELECT 'Practical Project','project',100,20.00,'2026-11-12 16:00:00' UNION ALL
 SELECT 'Midterm Assessment','midterm',100,20.00,'2026-11-20 16:00:00' UNION ALL
 SELECT 'Final Examination','final',100,40.00,'2026-12-15 09:00:00'
) a WHERE o.id=(SELECT MIN(id) FROM course_offerings)
AND NOT EXISTS(SELECT 1 FROM assessments old WHERE old.offering_id=o.id AND old.title=a.title);
INSERT INTO grades(assessment_id,student_id,score,feedback,graded_by,graded_at,published)
SELECT a.id,st.id,CASE WHEN MOD(st.id+a.id,5)=0 THEN 68 ELSE 75+MOD(st.id*3+a.id,21) END,'Demonstration grade; review instructor feedback.',(SELECT MIN(id) FROM teachers),NOW(),1
FROM assessments a JOIN students st ON st.student_number LIKE 'SA-2026-%'
WHERE a.offering_id=(SELECT MIN(id) FROM course_offerings) AND a.title IN ('Test 1','Practical Project')
ON DUPLICATE KEY UPDATE score=VALUES(score),published=VALUES(published);
INSERT INTO assignment_submissions(assessment_id,student_id,submission_text,submitted_at,status)
SELECT a.id,st.id,'Demonstration submission record.',DATE_SUB(NOW(),INTERVAL 1 DAY),'submitted'
FROM assessments a JOIN students st ON st.student_number LIKE 'SA-2026-%'
WHERE a.offering_id=(SELECT MIN(id) FROM course_offerings) AND a.title='Practical Project'
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 10 learning/public resources
INSERT INTO resources(title,description,category,file_url,audience,published,uploaded_by) VALUES
('Academic Calendar 2026/2027','Key dates for the academic year.','calendar','/uploads/resources/academic-calendar-2026-2027.pdf','public',1,(SELECT id FROM users WHERE username='demo_admin')),
('Student Handbook','College policies, services and student responsibilities.','student_guide','/uploads/resources/student-handbook.pdf','students',1,(SELECT id FROM users WHERE username='demo_admin')),
('Admissions Application Form','Application form for prospective students.','form','/uploads/resources/admissions-form.pdf','public',1,(SELECT id FROM users WHERE username='demo_admin')),
('Workshop Safety Guide','Basic safety requirements for workshops.','policy','/uploads/resources/workshop-safety.pdf','students',1,(SELECT id FROM users WHERE username='demo_admin')),
('Assessment and Grading Policy','Assessment rules and grading information.','policy','/uploads/resources/assessment-policy.pdf','students',1,(SELECT id FROM users WHERE username='demo_admin')),
('Teacher Course Guide','Guidance for course delivery and assessment.','other','/uploads/resources/teacher-course-guide.pdf','teachers',1,(SELECT id FROM users WHERE username='demo_admin')),
('ICT Laboratory Rules','Rules for safe and appropriate ICT lab use.','policy','/uploads/resources/ict-lab-rules.pdf','students',1,(SELECT id FROM users WHERE username='demo_admin')),
('Library User Guide','How to access library and learning resources.','student_guide','/uploads/resources/library-guide.pdf','public',1,(SELECT id FROM users WHERE username='demo_admin')),
('Student Clearance Form','Form for the student clearance process.','form','/uploads/resources/clearance-form.pdf','students',1,(SELECT id FROM users WHERE username='demo_admin')),
('Practical Training Logbook','Template for documenting practical training.','learning_material','/uploads/resources/training-logbook.pdf','students',1,(SELECT id FROM users WHERE username='demo_admin'))
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 10 events and 10 news articles
INSERT INTO events(title,slug,summary,body,location,starts_at,ends_at,status,created_by) VALUES
('Academic Year Opening','academic-year-opening-2026','Opening of the academic year.','Orientation and academic year opening program.','College Main Hall','2026-09-15 09:00:00','2026-09-15 12:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('Student Orientation','student-orientation-2026','Orientation for new students.','Introduction to college services and expectations.','Main Hall','2026-09-17 09:00:00','2026-09-17 15:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('Workshop Safety Day','workshop-safety-day-2026','Safety induction for practical programs.','Workshop demonstrations and safety briefing.','Workshop Block','2026-09-20 09:00:00','2026-09-20 13:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('Library Introduction','library-introduction-2026','Introduction to library resources.','Students learn how to access study materials.','Library','2026-09-22 10:00:00','2026-09-22 12:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('ICT Lab Demonstration','ict-lab-demonstration-2026','Practical demonstration in the ICT lab.','Students explore computer lab facilities.','ICT Laboratory','2026-09-25 10:00:00','2026-09-25 12:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('Career Guidance Session','career-guidance-2026','Career planning and workplace readiness.','Guidance on career pathways and professional conduct.','Conference Room','2026-10-10 09:00:00','2026-10-10 12:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('Student Project Exhibition','student-project-exhibition-2026','Showcase of student practical projects.','Students present projects developed in their programs.','College Courtyard','2026-11-10 09:00:00','2026-11-10 15:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('Mid-semester Assessment Week','mid-semester-assessment-week-2026','Scheduled mid-semester assessments.','Assessment activities by department.','Classrooms and Workshops','2026-11-16 08:00:00','2026-11-20 17:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('Community Skills Day','community-skills-day-2026','Skills demonstrations for the community.','College departments demonstrate vocational skills.','College Campus','2026-12-05 09:00:00','2026-12-05 14:00:00','published',(SELECT id FROM users WHERE username='demo_admin')),
('End of Semester Review','end-semester-review-2026','Semester review and student feedback.','Academic review and feedback activities.','Main Hall','2026-12-18 09:00:00','2026-12-18 12:00:00','published',(SELECT id FROM users WHERE username='demo_admin'))
ON DUPLICATE KEY UPDATE summary=VALUES(summary);
INSERT INTO news_articles(title,slug,summary,body,image_url,status,published_at,author_id) VALUES
('College Opens the 2026/2027 Academic Year','college-opens-2026-2027','The college welcomes students for the new academic year.','Saint Anthony’s Technical and Vocational College welcomes students and staff to the new academic year.','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80','published','2026-09-15 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('New Student Orientation Completed','new-student-orientation-completed','New students were introduced to college services.','Orientation covered academic expectations, support services and workshop safety.','https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80','published','2026-09-18 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Workshop Safety Training Begins','workshop-safety-training-begins','Practical safety training is underway.','Departments are conducting safety inductions before practical training.','https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80','published','2026-09-21 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Library Resources Updated','library-resources-updated','Additional learning resources are available.','The library resource list has been updated for students and instructors.','https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80','published','2026-09-27 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('ICT Laboratory Supports Practical Learning','ict-lab-practical-learning','ICT students are developing practical computer skills.','Laboratory activities support computer maintenance and networking practice.','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80','published','2026-10-01 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Admissions Office Shares Application Guidance','admissions-application-guidance','Prospective students can request program information.','The admissions office provides information about available programs and application steps.','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80','published','2026-10-03 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Teachers Coordinate Semester Assessments','teachers-coordinate-assessments','Departments are coordinating assessment schedules.','Teaching staff are aligning assessment schedules and communicating dates to students.','https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80','published','2026-10-05 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Students Prepare Practical Projects','students-prepare-practical-projects','Students are working on applied projects.','Practical projects help students demonstrate occupational competencies.','https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80','published','2026-10-07 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('College Emphasizes Attendance and Participation','college-attendance-participation','Regular attendance supports learning progress.','Students are reminded to attend lessons and practical sessions consistently.','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80','published','2026-10-09 08:00:00',(SELECT id FROM users WHERE username='demo_admin')),
('Mid-semester Assessment Schedule Published','mid-semester-assessment-schedule','Students should review the upcoming assessment schedule.','Students should confirm dates with instructors and prepare for scheduled assessments.','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80','published','2026-10-10 08:00:00',(SELECT id FROM users WHERE username='demo_admin'))
ON DUPLICATE KEY UPDATE summary=VALUES(summary);

-- 10 site settings
INSERT INTO site_settings(setting_key,setting_value) VALUES
('college_name','Saint Anthony''s Technical and Vocational College'),('short_name','SATVC'),('public_email','info@example.edu.et'),
('public_phone','+251-00-000-0000'),('address','Hossana, Ethiopia'),('crs_support_note','Supported by the Catholic Church and CRS Ethiopia.'),
('academic_year','2026/2027'),('default_language','en'),('timezone','Africa/Addis_Ababa'),('maintenance_mode','false')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- Verify seed counts
SELECT 'users' table_name,COUNT(*) row_count FROM users UNION ALL
SELECT 'students',COUNT(*) FROM students UNION ALL SELECT 'teachers',COUNT(*) FROM teachers UNION ALL
SELECT 'programs',COUNT(*) FROM programs UNION ALL SELECT 'courses',COUNT(*) FROM courses UNION ALL
SELECT 'assignments',COUNT(*) FROM assignments UNION ALL SELECT 'announcements',COUNT(*) FROM announcements UNION ALL
SELECT 'attendance_sessions',COUNT(*) FROM attendance_sessions UNION ALL SELECT 'resources',COUNT(*) FROM resources UNION ALL
SELECT 'events',COUNT(*) FROM events UNION ALL SELECT 'news_articles',COUNT(*) FROM news_articles;
