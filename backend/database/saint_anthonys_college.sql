-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 15, 2026 at 09:45 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `saint_anthonys_college`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_calendar_events`
--

CREATE TABLE `academic_calendar_events` (
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `event_type` varchar(60) NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
  `location` varchar(120) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_calendar_events`
--

INSERT INTO `academic_calendar_events` (`event_id`, `title`, `event_type`, `starts_at`, `ends_at`, `location`, `created_by`, `created_at`) VALUES
(1, 'Orientation Week', 'orientation', '2026-11-06 00:00:00', '2026-11-07 00:00:00', 'Main Hall', NULL, '2026-11-05 14:32:20'),
(1001, 'Department coordination meeting', 'meeting', '2026-11-12 09:00:00', '2026-11-12 11:00:00', 'Conference Room', 1, '2026-11-06 05:30:00'),
(1002, 'Practical assessment period', 'assessment', '2026-11-16 08:00:00', '2026-11-20 17:00:00', 'Workshops', 1, '2026-11-06 05:30:00'),
(1003, 'Student project exhibition', 'event', '2026-11-25 09:00:00', '2026-11-25 15:00:00', 'College Courtyard', 1, '2026-11-06 05:30:00'),
(1004, 'Community skills day', 'event', '2026-12-05 09:00:00', '2026-12-05 14:00:00', 'College Campus', 1, '2026-11-06 05:30:00'),
(1005, 'Semester examination period', 'exam', '2026-12-14 08:00:00', '2026-12-18 17:00:00', 'Classrooms', 1, '2026-11-06 05:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `academic_settings`
--

CREATE TABLE `academic_settings` (
  `setting_id` bigint(20) UNSIGNED NOT NULL,
  `setting_key` varchar(120) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_settings`
--

INSERT INTO `academic_settings` (`setting_id`, `setting_key`, `setting_value`, `description`, `updated_by`, `updated_at`) VALUES
(1, 'grading_weights_mode', 'per_offering', 'Assessment weights are configured for each course offering.', NULL, '2026-11-09 08:29:45'),
(2, 'grade_approval_required', '1', 'Grades must be reviewed before publication.', NULL, '2026-11-09 08:29:45'),
(3, 'student_self_registration', '0', 'Student accounts are provisioned by authorized staff.', NULL, '2026-11-09 08:29:45');

-- --------------------------------------------------------

--
-- Table structure for table `academic_years`
--

CREATE TABLE `academic_years` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(30) NOT NULL,
  `starts_on` date NOT NULL,
  `ends_on` date NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0
) ;

--
-- Dumping data for table `academic_years`
--

INSERT INTO `academic_years` (`id`, `name`, `starts_on`, `ends_on`, `is_current`) VALUES
(1, '2026/2027', '2026-09-01', '2027-08-31', 1),
(2, '2025/2026', '2025-09-01', '2026-08-31', 0);

-- --------------------------------------------------------

--
-- Table structure for table `admissions`
--

CREATE TABLE `admissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `application_number` varchar(40) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('female','male','other','undisclosed') DEFAULT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(190) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `program_id` bigint(20) UNSIGNED NOT NULL,
  `previous_education` varchar(180) DEFAULT NULL,
  `application_status` enum('submitted','under_review','accepted','rejected','enrolled') NOT NULL DEFAULT 'submitted',
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `review_note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admissions`
--

INSERT INTO `admissions` (`id`, `application_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `phone`, `email`, `address`, `program_id`, `previous_education`, `application_status`, `submitted_at`, `reviewed_by`, `review_note`) VALUES
(1001, 'APP-2026-0001', 'Mulu', 'Kassa', '2007-02-02', 'female', '+251911000001', 'applicant1@example.test', 'Hossana, Ethiopia', 1, 'Grade 10 completion', 'submitted', '2026-11-02 10:00:00', 1, 'Demo admissions record'),
(1002, 'APP-2026-0002', 'Tewodros', 'Alemayehu', '2007-03-03', 'male', '+251911000002', 'applicant2@example.test', 'Hossana, Ethiopia', 2, 'Grade 10 completion', 'under_review', '2026-11-03 10:00:00', 1, 'Demo admissions record'),
(1003, 'APP-2026-0003', 'Eyerusalem', 'Abebe', '2007-04-04', 'female', '+251911000003', 'applicant3@example.test', 'Hossana, Ethiopia', 3, 'Grade 10 completion', 'accepted', '2026-11-04 10:00:00', 1, 'Demo admissions record'),
(1004, 'APP-2026-0004', 'Kebede', 'Mekuria', '2007-05-05', 'male', '+251911000004', 'applicant4@example.test', 'Hossana, Ethiopia', 4, 'Grade 10 completion', 'rejected', '2026-11-05 10:00:00', 1, 'Demo admissions record'),
(1005, 'APP-2026-0005', 'Hirut', 'Desta', '2007-06-06', 'female', '+251911000005', 'applicant5@example.test', 'Hossana, Ethiopia', 5, 'Grade 10 completion', 'enrolled', '2026-11-06 10:00:00', 1, 'Demo admissions record'),
(1006, 'APP-2026-0006', 'Fikru', 'Lemma', '2007-07-07', 'male', '+251911000006', 'applicant6@example.test', 'Hossana, Ethiopia', 6, 'Grade 10 completion', 'submitted', '2026-11-07 10:00:00', 1, 'Demo admissions record');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `audience` enum('everyone','students','teachers','staff') NOT NULL DEFAULT 'everyone',
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `class_group_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `body`, `audience`, `status`, `published_at`, `expires_at`, `created_by`, `created_at`, `department_id`, `class_group_id`) VALUES
(1, 'Welcome to the 2026/2027 Academic Year', 'Welcome to the new academic year. Please check your timetable and meet your instructors.', 'everyone', 'published', '2026-09-15 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(2, 'Student Registration Reminder', 'Students should confirm their registration details with the registrar.', 'students', 'published', '2026-09-16 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(3, 'Workshop Safety Orientation', 'All students must attend workshop safety orientation before practical sessions.', 'students', 'published', '2026-09-18 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(4, 'Updated Class Timetable', 'The semester timetable is available from the academic office.', 'everyone', 'published', '2026-09-20 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(5, 'Assessment Schedule', 'Review the assessment dates and contact your instructor if there is a conflict.', 'students', 'published', '2026-09-22 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(6, 'Teaching Staff Meeting', 'Teaching staff meeting will be held in the academic office.', 'teachers', 'published', '2026-09-24 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(7, 'Library Resource Update', 'New learning materials have been added to the resource list.', 'everyone', 'published', '2026-09-26 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(8, 'Attendance Policy', 'Students are expected to attend all scheduled classes and practical sessions.', 'students', 'published', '2026-09-28 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(9, 'Admissions Enquiries', 'Prospective students may contact the admissions office for program information.', 'everyone', 'published', '2026-10-01 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(10, 'Mid-semester Assessment Schedule Published', 'Check the updated assessment calendar and confirm your examination dates.', 'students', 'published', '2026-10-05 09:00:00', NULL, 1, '2026-10-11 09:18:54', NULL, NULL),
(1001, 'Practical Workshop Rotation', 'Workshop groups will rotate according to the updated practical timetable. Students should check their assigned room before each session.', 'students', 'published', '2026-11-06 08:00:00', NULL, 1, '2026-11-06 05:00:00', NULL, NULL),
(1002, 'Library Study Hours', 'The library is available for quiet study and supervised group work during normal college hours.', 'everyone', 'published', '2026-11-06 08:00:00', NULL, 1, '2026-11-06 05:00:00', NULL, NULL),
(1003, 'Teacher Planning Meeting', 'Department representatives should submit the next teaching plan before the weekly coordination meeting.', 'teachers', 'published', '2026-11-06 08:00:00', NULL, 1, '2026-11-06 05:00:00', NULL, NULL),
(1004, 'Student Project Exhibition', 'Students are invited to prepare practical demonstrations for the upcoming project exhibition.', 'students', 'published', '2026-11-06 08:00:00', NULL, 1, '2026-11-06 05:00:00', NULL, NULL),
(1005, 'Campus Clean-up Day', 'Students and staff will take part in a shared campus maintenance activity.', 'everyone', 'published', '2026-11-06 08:00:00', NULL, 1, '2026-11-06 05:00:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `announcement_reads`
--

CREATE TABLE `announcement_reads` (
  `announcement_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `read_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcement_reads`
--

INSERT INTO `announcement_reads` (`announcement_id`, `user_id`, `read_at`) VALUES
(1001, 1005, '2026-11-06 09:00:00'),
(1001, 1010, '2026-11-06 09:00:00'),
(1001, 1015, '2026-11-06 09:00:00'),
(1001, 1020, '2026-11-06 09:00:00'),
(1002, 1001, '2026-11-06 09:00:00'),
(1002, 1006, '2026-11-06 09:00:00'),
(1002, 1011, '2026-11-06 09:00:00'),
(1002, 1016, '2026-11-06 09:00:00'),
(1002, 1021, '2026-11-06 09:00:00'),
(1003, 1002, '2026-11-06 09:00:00'),
(1003, 1007, '2026-11-06 09:00:00'),
(1003, 1012, '2026-11-06 09:00:00'),
(1003, 1017, '2026-11-06 09:00:00'),
(1003, 1022, '2026-11-06 09:00:00'),
(1004, 1003, '2026-11-06 09:00:00'),
(1004, 1008, '2026-11-06 09:00:00'),
(1004, 1013, '2026-11-06 09:00:00'),
(1004, 1018, '2026-11-06 09:00:00'),
(1005, 1004, '2026-11-06 09:00:00'),
(1005, 1009, '2026-11-06 09:00:00'),
(1005, 1014, '2026-11-06 09:00:00'),
(1005, 1019, '2026-11-06 09:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `assessments`
--

CREATE TABLE `assessments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `offering_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `assessment_type` enum('test','project','midterm','final','practical','quiz','other') NOT NULL,
  `max_score` decimal(6,2) NOT NULL DEFAULT 100.00,
  `weight_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `due_date` datetime DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0
) ;

--
-- Dumping data for table `assessments`
--

INSERT INTO `assessments` (`id`, `offering_id`, `title`, `assessment_type`, `max_score`, `weight_percent`, `due_date`, `published`) VALUES
(1, 1, 'Test 1', 'test', 100.00, 10.00, '2026-10-20 16:00:00', 1),
(2, 1, 'Test 2', 'test', 100.00, 10.00, '2026-11-03 16:00:00', 1),
(3, 1, 'Practical Project', 'project', 100.00, 20.00, '2026-11-12 16:00:00', 1),
(4, 1, 'Midterm Assessment', 'midterm', 100.00, 20.00, '2026-11-20 16:00:00', 1),
(5, 1, 'Final Examination', 'final', 100.00, 40.00, '2026-12-15 09:00:00', 1),
(1001, 11, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1002, 11, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1003, 11, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1004, 12, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1005, 12, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1006, 12, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1007, 13, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1008, 13, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1009, 13, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1010, 14, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1011, 14, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1012, 14, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1013, 15, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1014, 15, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1015, 15, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1016, 16, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1017, 16, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1018, 16, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1019, 17, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1020, 17, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1021, 17, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1022, 18, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1023, 18, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1024, 18, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1025, 19, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1026, 19, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1027, 19, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1),
(1028, 20, 'Knowledge Test', 'test', 100.00, 30.00, '2026-11-18 10:00:00', 1),
(1029, 20, 'Practical Competency', 'practical', 100.00, 30.00, '2026-12-02 10:00:00', 1),
(1030, 20, 'Final Assessment', 'final', 100.00, 40.00, '2026-12-16 09:00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `offering_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `instructions` text DEFAULT NULL,
  `due_at` datetime DEFAULT NULL,
  `max_score` decimal(6,2) NOT NULL DEFAULT 100.00,
  `attachment_url` varchar(500) DEFAULT NULL,
  `status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `offering_id`, `title`, `instructions`, `due_at`, `max_score`, `attachment_url`, `status`, `created_at`) VALUES
(1, 1, 'Workshop safety checklist', 'Submit a completed workshop safety checklist.', '2026-10-20 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(2, 2, 'Tools identification', 'Identify ten tools and explain their safe use.', '2026-10-22 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(3, 3, 'Practical exercise 1', 'Complete the assigned practical exercise and upload a short report.', '2026-10-24 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(4, 4, 'Module worksheet', 'Answer all questions in the module worksheet.', '2026-10-26 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(5, 5, 'Troubleshooting task', 'Document the steps used to diagnose the supplied fault.', '2026-10-28 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(6, 6, 'Individual project proposal', 'Submit a one-page proposal for your practical project.', '2026-10-30 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(7, 7, 'Practical report', 'Describe the process, tools and safety measures used.', '2026-11-02 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(8, 8, 'Mid-module review', 'Complete the revision questions for this module.', '2026-11-04 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(9, 9, 'Team demonstration', 'Prepare a brief demonstration with your assigned team.', '2026-11-06 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(10, 10, 'Final portfolio', 'Submit your module portfolio for review.', '2026-11-10 16:00:00', 100.00, NULL, 'published', '2026-10-11 09:14:18'),
(1001, 11, 'Practical task 1', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-11 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1002, 12, 'Practical task 2', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-12 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1003, 13, 'Practical task 3', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-13 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1004, 14, 'Practical task 4', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-14 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1005, 15, 'Practical task 5', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-15 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1006, 16, 'Practical task 6', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-16 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1007, 17, 'Practical task 7', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-17 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1008, 18, 'Practical task 8', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-18 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1009, 19, 'Practical task 9', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-19 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00'),
(1010, 20, 'Practical task 10', 'Complete the practical activity, document the process, and submit the required evidence.', '2026-12-10 16:00:00', 100.00, NULL, 'published', '2026-11-06 05:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `assessment_id` bigint(20) UNSIGNED NOT NULL,
  `assignment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `attempt_number` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `submission_text` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `status` enum('draft','submitted','late','graded','returned') NOT NULL DEFAULT 'draft',
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignment_submissions`
--

INSERT INTO `assignment_submissions` (`id`, `assessment_id`, `assignment_id`, `student_id`, `attempt_number`, `submission_text`, `file_url`, `submitted_at`, `status`, `reviewed_by`, `reviewed_at`, `feedback`) VALUES
(1, 3, NULL, 11, 1, 'Demonstration submission record.', NULL, '2026-10-10 12:18:56', 'submitted', NULL, NULL, NULL),
(1001, 1001, NULL, 12, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-02 13:30:00', 'graded', NULL, NULL, NULL),
(1002, 1004, NULL, 13, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-03 13:30:00', 'late', NULL, NULL, NULL),
(1003, 1007, NULL, 14, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-04 13:30:00', 'returned', NULL, NULL, NULL),
(1004, 1010, NULL, 15, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-05 13:30:00', 'submitted', NULL, NULL, NULL),
(1005, 1013, NULL, 16, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-01 13:30:00', 'graded', NULL, NULL, NULL),
(1006, 1016, NULL, 17, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-02 13:30:00', 'late', NULL, NULL, NULL),
(1007, 1019, NULL, 18, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-03 13:30:00', 'returned', NULL, NULL, NULL),
(1008, 1022, NULL, 19, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-04 13:30:00', 'submitted', NULL, NULL, NULL),
(1009, 1025, NULL, 20, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-05 13:30:00', 'graded', NULL, NULL, NULL),
(1010, 1028, NULL, 21, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-01 13:30:00', 'late', NULL, NULL, NULL),
(1011, 1001, NULL, 22, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-02 13:30:00', 'returned', NULL, NULL, NULL),
(1012, 1004, NULL, 23, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-03 13:30:00', 'submitted', NULL, NULL, NULL),
(1013, 1007, NULL, 24, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-04 13:30:00', 'graded', NULL, NULL, NULL),
(1014, 1010, NULL, 25, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-05 13:30:00', 'late', NULL, NULL, NULL),
(1015, 1013, NULL, 26, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-01 13:30:00', 'returned', NULL, NULL, NULL),
(1016, 1016, NULL, 27, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-02 13:30:00', 'submitted', NULL, NULL, NULL),
(1017, 1019, NULL, 28, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-03 13:30:00', 'graded', NULL, NULL, NULL),
(1018, 1022, NULL, 29, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-04 13:30:00', 'late', NULL, NULL, NULL),
(1019, 1025, NULL, 30, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-05 13:30:00', 'returned', NULL, NULL, NULL),
(1020, 1028, NULL, 31, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-01 13:30:00', 'submitted', NULL, NULL, NULL),
(1021, 1001, NULL, 32, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-02 13:30:00', 'graded', NULL, NULL, NULL),
(1022, 1004, NULL, 33, 1, 'I completed the assigned task and documented the steps taken.', NULL, '2026-11-03 13:30:00', 'late', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('present','absent','late','excused') NOT NULL DEFAULT 'present',
  `note` varchar(255) DEFAULT NULL,
  `marked_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `session_id`, `student_id`, `status`, `note`, `marked_at`) VALUES
(1, 1, 11, 'present', NULL, '2026-10-11 12:18:55'),
(2, 2, 11, 'present', NULL, '2026-10-11 12:18:55'),
(3, 3, 11, 'absent', NULL, '2026-10-11 12:18:55'),
(4, 4, 11, 'present', NULL, '2026-10-11 12:18:55'),
(5, 5, 11, 'present', NULL, '2026-10-11 12:18:55'),
(6, 6, 11, 'present', NULL, '2026-10-11 12:18:55'),
(7, 7, 11, 'present', NULL, '2026-10-11 12:18:55'),
(8, 8, 11, 'present', NULL, '2026-10-11 12:18:55'),
(9, 9, 11, 'late', NULL, '2026-10-11 12:18:55'),
(10, 10, 11, 'absent', NULL, '2026-10-11 12:18:55'),
(1000, 1001, 12, 'present', NULL, '2026-10-16 09:00:00'),
(1001, 1002, 12, 'late', 'Arrived after the session started', '2026-10-16 09:00:00'),
(1002, 1003, 13, 'late', 'Arrived after the session started', '2026-10-17 09:00:00'),
(1003, 1004, 13, 'absent', NULL, '2026-10-17 09:00:00'),
(1004, 1005, 14, 'absent', NULL, '2026-10-18 09:00:00'),
(1005, 1006, 14, 'excused', 'Approved absence', '2026-10-18 09:00:00'),
(1006, 1007, 15, 'excused', 'Approved absence', '2026-10-19 09:00:00'),
(1007, 1008, 15, 'present', NULL, '2026-10-19 09:00:00'),
(1008, 1009, 16, 'present', NULL, '2026-10-20 09:00:00'),
(1009, 1010, 16, 'present', NULL, '2026-10-20 09:00:00'),
(1010, 1011, 17, 'present', NULL, '2026-10-21 09:00:00'),
(1011, 1012, 17, 'present', NULL, '2026-10-21 09:00:00'),
(1012, 1013, 18, 'present', NULL, '2026-10-22 09:00:00'),
(1013, 1014, 18, 'late', 'Arrived after the session started', '2026-10-22 09:00:00'),
(1014, 1015, 19, 'late', 'Arrived after the session started', '2026-10-23 09:00:00'),
(1015, 1016, 19, 'absent', NULL, '2026-10-23 09:00:00'),
(1016, 1017, 20, 'absent', NULL, '2026-10-24 09:00:00'),
(1017, 1018, 20, 'excused', 'Approved absence', '2026-10-24 09:00:00'),
(1018, 1019, 21, 'excused', 'Approved absence', '2026-10-15 09:00:00'),
(1019, 1020, 21, 'present', NULL, '2026-10-15 09:00:00'),
(1020, 1001, 22, 'present', NULL, '2026-10-16 09:00:00'),
(1021, 1002, 22, 'present', NULL, '2026-10-16 09:00:00'),
(1022, 1003, 23, 'present', NULL, '2026-10-17 09:00:00'),
(1023, 1004, 23, 'present', NULL, '2026-10-17 09:00:00'),
(1024, 1005, 24, 'present', NULL, '2026-10-18 09:00:00'),
(1025, 1006, 24, 'late', 'Arrived after the session started', '2026-10-18 09:00:00'),
(1026, 1007, 25, 'late', 'Arrived after the session started', '2026-10-19 09:00:00'),
(1027, 1008, 25, 'absent', NULL, '2026-10-19 09:00:00'),
(1028, 1009, 26, 'absent', NULL, '2026-10-20 09:00:00'),
(1029, 1010, 26, 'excused', 'Approved absence', '2026-10-20 09:00:00'),
(1030, 1011, 27, 'excused', 'Approved absence', '2026-10-21 09:00:00'),
(1031, 1012, 27, 'present', NULL, '2026-10-21 09:00:00'),
(1032, 1013, 28, 'present', NULL, '2026-10-22 09:00:00'),
(1033, 1014, 28, 'present', NULL, '2026-10-22 09:00:00'),
(1034, 1015, 29, 'present', NULL, '2026-10-23 09:00:00'),
(1035, 1016, 29, 'present', NULL, '2026-10-23 09:00:00'),
(1036, 1017, 30, 'present', NULL, '2026-10-24 09:00:00'),
(1037, 1018, 30, 'late', 'Arrived after the session started', '2026-10-24 09:00:00'),
(1038, 1019, 31, 'late', 'Arrived after the session started', '2026-10-15 09:00:00'),
(1039, 1020, 31, 'absent', NULL, '2026-10-15 09:00:00'),
(1040, 1001, 32, 'absent', NULL, '2026-10-16 09:00:00'),
(1041, 1002, 32, 'excused', 'Approved absence', '2026-10-16 09:00:00'),
(1042, 1003, 33, 'excused', 'Approved absence', '2026-10-17 09:00:00'),
(1043, 1004, 33, 'present', NULL, '2026-10-17 09:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_sessions`
--

CREATE TABLE `attendance_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `offering_id` bigint(20) UNSIGNED NOT NULL,
  `session_date` date NOT NULL,
  `topic` varchar(180) DEFAULT NULL,
  `recorded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_sessions`
--

INSERT INTO `attendance_sessions` (`id`, `offering_id`, `session_date`, `topic`, `recorded_by`, `created_at`) VALUES
(1, 1, '2026-10-02', 'Practical session 1', 1, '2026-10-11 09:18:55'),
(2, 1, '2026-10-03', 'Practical session 2', 1, '2026-10-11 09:18:55'),
(3, 1, '2026-10-04', 'Practical session 3', 1, '2026-10-11 09:18:55'),
(4, 1, '2026-10-05', 'Practical session 4', 1, '2026-10-11 09:18:55'),
(5, 1, '2026-10-06', 'Practical session 5', 1, '2026-10-11 09:18:55'),
(6, 1, '2026-10-07', 'Practical session 6', 1, '2026-10-11 09:18:55'),
(7, 1, '2026-10-08', 'Practical session 7', 1, '2026-10-11 09:18:55'),
(8, 1, '2026-10-09', 'Practical session 8', 1, '2026-10-11 09:18:55'),
(9, 1, '2026-10-10', 'Practical session 9', 1, '2026-10-11 09:18:55'),
(10, 1, '2026-10-11', 'Practical session 10', 1, '2026-10-11 09:18:55'),
(1001, 11, '2026-10-09', 'Lesson 1: practical and theory session', 3, '2026-11-06 05:30:00'),
(1002, 11, '2026-10-12', 'Lesson 2: practical and theory session', 3, '2026-11-06 05:30:00'),
(1003, 12, '2026-10-10', 'Lesson 1: practical and theory session', 4, '2026-11-06 05:30:00'),
(1004, 12, '2026-10-13', 'Lesson 2: practical and theory session', 4, '2026-11-06 05:30:00'),
(1005, 13, '2026-10-11', 'Lesson 1: practical and theory session', 5, '2026-11-06 05:30:00'),
(1006, 13, '2026-10-14', 'Lesson 2: practical and theory session', 5, '2026-11-06 05:30:00'),
(1007, 14, '2026-10-12', 'Lesson 1: practical and theory session', 6, '2026-11-06 05:30:00'),
(1008, 14, '2026-10-15', 'Lesson 2: practical and theory session', 6, '2026-11-06 05:30:00'),
(1009, 15, '2026-10-13', 'Lesson 1: practical and theory session', 7, '2026-11-06 05:30:00'),
(1010, 15, '2026-10-16', 'Lesson 2: practical and theory session', 7, '2026-11-06 05:30:00'),
(1011, 16, '2026-10-14', 'Lesson 1: practical and theory session', 3, '2026-11-06 05:30:00'),
(1012, 16, '2026-10-17', 'Lesson 2: practical and theory session', 3, '2026-11-06 05:30:00'),
(1013, 17, '2026-10-15', 'Lesson 1: practical and theory session', 4, '2026-11-06 05:30:00'),
(1014, 17, '2026-10-18', 'Lesson 2: practical and theory session', 4, '2026-11-06 05:30:00'),
(1015, 18, '2026-10-16', 'Lesson 1: practical and theory session', 5, '2026-11-06 05:30:00'),
(1016, 18, '2026-10-19', 'Lesson 2: practical and theory session', 5, '2026-11-06 05:30:00'),
(1017, 19, '2026-10-17', 'Lesson 1: practical and theory session', 6, '2026-11-06 05:30:00'),
(1018, 19, '2026-10-20', 'Lesson 2: practical and theory session', 6, '2026-11-06 05:30:00'),
(1019, 20, '2026-10-08', 'Lesson 1: practical and theory session', 7, '2026-11-06 05:30:00'),
(1020, 20, '2026-10-11', 'Lesson 2: practical and theory session', 7, '2026-11-06 05:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `audit_id` bigint(20) UNSIGNED NOT NULL,
  `actor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(80) NOT NULL,
  `entity_type` varchar(80) NOT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`audit_id`, `actor_user_id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 1, 'seed_run', 'system', 1, '{\"source\":\"phpmyadmin\",\"note\":\"Initial operational baseline created.\"}', NULL, NULL, '2026-11-05 14:32:21'),
(2, 1, 1, 'login', 'user', 1, '{\"username\":\"demo_admin\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.5737', '2026-11-05 14:35:36'),
(3, 7, 7, 'login', 'user', 7, '{\"username\":\"demo_teacher01\",\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-05 15:09:21'),
(4, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', '2026-11-05 15:23:35'),
(5, 1, 1, 'login', 'user', 1, '{\"username\":\"demo_admin\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', '2026-11-05 15:24:35'),
(6, 1, 21, 'student_deleted', 'student', 5, '{\"student_number\":\"ST-DEMO-005\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-05 15:25:25'),
(7, 1, 22, 'student_deleted', 'student', 6, '{\"student_number\":\"ST-DEMO-006\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-05 15:25:26'),
(8, 1, 23, 'student_deleted', 'student', 7, '{\"student_number\":\"ST-DEMO-007\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-05 15:25:27'),
(9, 7, 7, 'login', 'user', 7, '{\"username\":\"demo_teacher01\",\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.129.1 Chrome/148.0.7778.280 Electron/42.6.0 Safari/537.36', '2026-11-06 06:40:09'),
(10, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', '2026-11-06 06:56:14'),
(11, 7, 7, 'login', 'user', 7, '{\"username\":\"demo_teacher01\",\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36', '2026-11-06 07:24:22'),
(12, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36', '2026-11-06 07:40:41'),
(1001, 1, 1001, 'demo_record_created', 'demo_dataset', 1, '{\"demo\":true,\"record\":1,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1002, 1, 1002, 'demo_record_created', 'demo_dataset', 2, '{\"demo\":true,\"record\":2,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1003, 1, 1003, 'demo_record_created', 'demo_dataset', 3, '{\"demo\":true,\"record\":3,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1004, 1, 1004, 'demo_record_created', 'demo_dataset', 4, '{\"demo\":true,\"record\":4,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1005, 1, 1005, 'demo_record_created', 'demo_dataset', 5, '{\"demo\":true,\"record\":5,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1006, 1, 1006, 'demo_record_created', 'demo_dataset', 6, '{\"demo\":true,\"record\":6,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1007, 1, 1007, 'demo_record_created', 'demo_dataset', 7, '{\"demo\":true,\"record\":7,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1008, 1, 1008, 'demo_record_created', 'demo_dataset', 8, '{\"demo\":true,\"record\":8,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1009, 1, 1009, 'demo_record_created', 'demo_dataset', 9, '{\"demo\":true,\"record\":9,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1010, 1, 1010, 'demo_record_created', 'demo_dataset', 10, '{\"demo\":true,\"record\":10,\"source\":\"demo_seed\"}', '127.0.0.1', 'Demo seed import', '2026-11-06 07:00:00'),
(1011, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-06 13:29:37'),
(1012, 1, 1, 'login', 'user', 1, '{\"username\":\"demo_admin\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-06 13:31:42'),
(1013, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-06 13:49:47'),
(1014, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-09 11:10:17'),
(1015, 1, 1, 'login', 'user', 1, '{\"username\":\"demo_admin\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-09 11:45:06'),
(1016, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-09 11:53:25'),
(1017, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-12 06:36:49'),
(1018, 1, 1, 'login', 'user', 1, '{\"username\":\"demo_admin\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 10:18:28'),
(1019, 1, 1, 'login', 'user', 1, '{\"username\":\"demo_admin\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 10:26:20'),
(1020, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:03:01'),
(1021, 7, 7, 'login', 'user', 7, '{\"username\":\"demo_teacher01\",\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:03:36'),
(1022, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:22:24'),
(1023, 18, 18, 'login', 'user', 18, '{\"username\":\"demo_student02\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:24:07'),
(1024, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:25:18'),
(1025, 19, 19, 'login', 'user', 19, '{\"username\":\"demo_student03\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:25:43'),
(1026, 8, 8, 'login', 'user', 8, '{\"username\":\"demo_teacher02\",\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:30:53'),
(1027, 7, 7, 'login', 'user', 7, '{\"username\":\"demo_teacher01\",\"role\":\"teacher\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:31:24'),
(1028, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:34:38'),
(1029, 18, 18, 'login', 'user', 18, '{\"username\":\"demo_student02\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:36:11'),
(1030, 20, 20, 'login', 'user', 20, '{\"username\":\"demo_student04\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:37:39'),
(1031, 21, 21, 'login', 'user', 21, '{\"username\":\"demo_student05\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:38:48'),
(1032, 20, 20, 'login', 'user', 20, '{\"username\":\"demo_student04\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:40:42'),
(1033, 26, 26, 'login', 'user', 26, '{\"username\":\"demo_student10\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 11:43:59'),
(1034, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:25:48'),
(1035, 1, 1, 'login', 'user', 1, '{\"username\":\"demo_admin\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:26:16'),
(1036, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 07:47:19'),
(1037, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 10:21:28'),
(1038, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 13:56:35'),
(1039, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 14:19:35'),
(1040, 17, 17, 'login', 'user', 17, '{\"username\":\"demo_student01\",\"role\":\"student\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-15 08:34:34'),
(1041, 1, 1, 'login', 'user', 1, '{\"username\":\"demo_admin\",\"role\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-15 08:38:52');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log_changes`
--

CREATE TABLE `audit_log_changes` (
  `change_id` bigint(20) UNSIGNED NOT NULL,
  `audit_id` bigint(20) UNSIGNED NOT NULL,
  `field_name` varchar(120) NOT NULL,
  `old_value` longtext DEFAULT NULL,
  `new_value` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classroom_resources`
--

CREATE TABLE `classroom_resources` (
  `resource_id` bigint(20) UNSIGNED NOT NULL,
  `classroom_id` bigint(20) UNSIGNED DEFAULT NULL,
  `resource_type` varchar(60) NOT NULL,
  `name` varchar(150) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `status` enum('available','in_use','maintenance','lost') NOT NULL DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classroom_resources`
--

INSERT INTO `classroom_resources` (`resource_id`, `classroom_id`, `resource_type`, `name`, `quantity`, `status`) VALUES
(1, NULL, 'projector', 'HD Projector', 4, 'available'),
(2, NULL, 'speaker', 'Portable Speaker', 2, 'available'),
(1001, NULL, 'computer', 'Desktop computer', 25, 'available'),
(1002, NULL, 'computer', 'Desktop computer', 5, 'maintenance'),
(1003, NULL, 'tool', 'Electrical installation tool kit', 12, 'available'),
(1004, NULL, 'tool', 'Automotive diagnostic kit', 4, 'in_use'),
(1005, NULL, 'safety', 'Protective helmet', 30, 'available'),
(1006, NULL, 'safety', 'Welding face shield', 15, 'available'),
(1007, NULL, 'projector', 'Classroom projector', 3, 'available'),
(1008, NULL, 'furniture', 'Student workbench', 10, 'in_use');

-- --------------------------------------------------------

--
-- Table structure for table `class_groups`
--

CREATE TABLE `class_groups` (
  `class_group_id` bigint(20) UNSIGNED NOT NULL,
  `program_id` bigint(20) UNSIGNED NOT NULL,
  `academic_year_id` bigint(20) UNSIGNED NOT NULL,
  `level_number` tinyint(3) UNSIGNED NOT NULL,
  `section_code` varchar(30) NOT NULL DEFAULT 'A',
  `group_name` varchar(120) NOT NULL,
  `capacity` smallint(5) UNSIGNED DEFAULT NULL,
  `status` enum('planned','active','completed','archived') NOT NULL DEFAULT 'planned',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `subject` varchar(180) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','in_progress','resolved','spam') NOT NULL DEFAULT 'new',
  `received_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `handled_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `full_name`, `email`, `subject`, `message`, `status`, `received_at`, `handled_by`) VALUES
(1001, 'Alemu Girma', 'alemu.girma@example.test', 'Program information', 'Please provide details about the Information Technology program.', 'new', '2026-11-06 06:00:00', NULL),
(1002, 'Marta Solomon', 'marta.solomon@example.test', 'Admission requirements', 'I would like to know the minimum entry requirements.', 'in_progress', '2026-11-06 06:00:00', 1),
(1003, 'Dawit Kebede', 'dawit.kebede@example.test', 'Campus visit', 'Can a group visit the college workshops?', 'resolved', '2026-11-06 06:00:00', 1),
(1004, 'Rahel Worku', 'rahel.worku@example.test', 'Application status', 'Please advise how to follow up an application.', 'new', '2026-11-06 06:00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(30) NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `credit_hours` tinyint(3) UNSIGNED NOT NULL DEFAULT 3,
  `program_id` bigint(20) UNSIGNED DEFAULT NULL,
  `level_number` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code`, `title`, `description`, `credit_hours`, `program_id`, `level_number`, `is_active`) VALUES
(1, 'ELI101', 'Electrical Safety and Tools', 'Workshop safety, electrical hazards and tool handling.', 3, 1, 1, 1),
(2, 'ELI102', 'Basic Wiring', 'Domestic wiring and installation practice.', 4, 1, 1, 1),
(3, 'ICT101', 'Computer Fundamentals', 'Computer hardware, operating systems and support.', 3, 2, 1, 1),
(4, 'ICT102', 'Networking Basics', 'LAN concepts, addressing and troubleshooting.', 4, 2, 1, 1),
(5, 'AUT101', 'Automotive Workshop Practice', 'Workshop tools, service routines and safety.', 4, 3, 1, 1),
(6, 'CON101', 'Construction Materials', 'Properties and use of common construction materials.', 3, 4, 1, 1),
(7, 'WLD101', 'Welding Fundamentals', 'Welding processes, equipment and safety.', 4, 5, 1, 1),
(8, 'PLB101', 'Plumbing Fundamentals', 'Pipes, fittings, water supply and drainage.', 3, 6, 1, 1),
(9, 'ACC101', 'Basic Accounting', 'Transactions, journals, ledgers and trial balance.', 3, 8, 1, 1),
(10, 'MEC101', 'Mechanical Workshop Skills', 'Measurement, hand tools and maintenance practice.', 4, 9, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `course_offerings`
--

CREATE TABLE `course_offerings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `semester_id` bigint(20) UNSIGNED NOT NULL,
  `section` varchar(20) NOT NULL DEFAULT 'A',
  `room` varchar(50) DEFAULT NULL,
  `room_id` bigint(20) UNSIGNED DEFAULT NULL,
  `capacity` smallint(5) UNSIGNED NOT NULL DEFAULT 40,
  `status` enum('planned','open','completed','cancelled') NOT NULL DEFAULT 'open',
  `lab_required` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_offerings`
--

INSERT INTO `course_offerings` (`id`, `course_id`, `teacher_id`, `semester_id`, `section`, `room`, `room_id`, `capacity`, `status`, `lab_required`) VALUES
(1, 9, 1, 1, 'A', 'Workshop 09', NULL, 35, 'open', 0),
(2, 5, 1, 1, 'A', 'Workshop 05', NULL, 35, 'open', 0),
(3, 6, 1, 1, 'A', 'Workshop 06', NULL, 35, 'open', 0),
(4, 1, 1, 1, 'A', 'Workshop 01', NULL, 35, 'open', 0),
(5, 2, 1, 1, 'A', 'Workshop 02', NULL, 35, 'open', 0),
(6, 3, 1, 1, 'A', 'Workshop 03', NULL, 35, 'open', 0),
(7, 4, 1, 1, 'A', 'Workshop 04', NULL, 35, 'open', 0),
(8, 10, 1, 1, 'A', 'Workshop 10', NULL, 35, 'open', 0),
(9, 8, 1, 1, 'A', 'Workshop 08', NULL, 35, 'open', 0),
(10, 7, 1, 1, 'A', 'Workshop 07', NULL, 35, 'open', 0),
(11, 1, 3, 1, 'B', 'Room 101', NULL, 35, 'open', 0),
(12, 2, 4, 1, 'B', 'Room 102', NULL, 35, 'open', 0),
(13, 3, 5, 1, 'B', 'Room 103', NULL, 35, 'open', 0),
(14, 4, 6, 1, 'B', 'Room 104', NULL, 35, 'open', 0),
(15, 5, 7, 1, 'B', 'Room 105', NULL, 35, 'open', 0),
(16, 6, 3, 1, 'B', 'Room 106', NULL, 35, 'open', 0),
(17, 7, 4, 1, 'B', 'Room 107', NULL, 35, 'open', 0),
(18, 8, 5, 1, 'B', 'Room 108', NULL, 35, 'open', 0),
(19, 9, 6, 1, 'B', 'Room 109', NULL, 35, 'open', 0),
(20, 10, 7, 1, 'B', 'Room 110', NULL, 35, 'open', 0);

-- --------------------------------------------------------

--
-- Table structure for table `data_export_logs`
--

CREATE TABLE `data_export_logs` (
  `export_id` bigint(20) UNSIGNED NOT NULL,
  `module_code` varchar(80) NOT NULL,
  `entity_name` varchar(100) NOT NULL,
  `file_type` enum('xlsx','csv','pdf','other') NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `filters_json` longtext DEFAULT NULL,
  `exported_by` bigint(20) UNSIGNED NOT NULL,
  `row_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `exported_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `data_import_batches`
--

CREATE TABLE `data_import_batches` (
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `module_code` varchar(80) NOT NULL,
  `entity_name` varchar(100) NOT NULL,
  `source_file` varchar(255) DEFAULT NULL,
  `file_type` enum('xlsx','xls','csv','other') NOT NULL DEFAULT 'xlsx',
  `imported_by` bigint(20) UNSIGNED NOT NULL,
  `status` enum('uploaded','validating','validated','partially_imported','imported','failed','cancelled') NOT NULL DEFAULT 'uploaded',
  `total_rows` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `valid_rows` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `invalid_rows` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `inserted_rows` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `updated_rows` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `error_rows` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `data_import_errors`
--

CREATE TABLE `data_import_errors` (
  `error_id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `import_row_id` bigint(20) UNSIGNED DEFAULT NULL,
  `row_number` int(10) UNSIGNED NOT NULL,
  `column_name` varchar(120) DEFAULT NULL,
  `error_code` varchar(80) DEFAULT NULL,
  `error_message` varchar(1000) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `data_import_rows`
--

CREATE TABLE `data_import_rows` (
  `import_row_id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `row_number` int(10) UNSIGNED NOT NULL,
  `row_status` enum('pending','valid','invalid','inserted','updated','skipped') NOT NULL DEFAULT 'pending',
  `source_data` longtext DEFAULT NULL,
  `normalized_data` longtext DEFAULT NULL,
  `target_record_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(30) NOT NULL,
  `head_staff_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `name`, `code`, `head_staff_id`, `created_at`) VALUES
(1, 'Academic Affairs', 'ACA', NULL, '2026-11-05 14:32:20'),
(2, 'Information Technology', 'IT', NULL, '2026-11-05 14:32:20'),
(3, 'Engineering', 'ENG', NULL, '2026-11-05 14:32:20'),
(4, 'Business Studies', 'BUS', NULL, '2026-11-05 14:32:20'),
(5, 'Hospitality', 'HOS', NULL, '2026-11-05 14:32:20'),
(111, 'Electrical Technology', '', NULL, '2026-11-14 07:09:44');

-- --------------------------------------------------------

--
-- Table structure for table `department_name_mapping_review`
--

CREATE TABLE `department_name_mapping_review` (
  `source_table` varchar(40) NOT NULL,
  `source_value` varchar(150) NOT NULL,
  `proposed_department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `review_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewer_notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `department_name_mapping_review`
--

INSERT INTO `department_name_mapping_review` (`source_table`, `source_value`, `proposed_department_id`, `review_status`, `reviewer_notes`) VALUES
('programs', 'Automotive', NULL, 'pending', NULL),
('programs', 'Building Services', NULL, 'pending', NULL),
('programs', 'Business', NULL, 'pending', NULL),
('programs', 'Construction', NULL, 'pending', NULL),
('programs', 'Electrical Technology', NULL, 'pending', NULL),
('programs', 'Hospitality', NULL, 'pending', NULL),
('programs', 'ICT', NULL, 'pending', NULL),
('programs', 'Manufacturing', NULL, 'pending', NULL),
('teachers', 'Automotive', NULL, 'pending', NULL),
('teachers', 'Building Services', NULL, 'pending', NULL),
('teachers', 'Business', NULL, 'pending', NULL),
('teachers', 'Construction', NULL, 'pending', NULL),
('teachers', 'Electrical Technology', NULL, 'pending', NULL),
('teachers', 'Hospitality', NULL, 'pending', NULL),
('teachers', 'ICT', NULL, 'pending', NULL),
('teachers', 'Information Technology', NULL, 'pending', NULL),
('teachers', 'Manufacturing', NULL, 'pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `document_templates`
--

CREATE TABLE `document_templates` (
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `template_name` varchar(120) NOT NULL,
  `template_type` varchar(40) NOT NULL,
  `body_html` mediumtext DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_templates`
--

INSERT INTO `document_templates` (`template_id`, `template_name`, `template_type`, `body_html`, `updated_by`, `updated_at`) VALUES
(1, 'Student Welcome Letter', 'student_welcome', '<p>Welcome to Saint Anthony’s College.</p>', NULL, '2026-11-05 14:32:20'),
(1001, 'Student Enrollment Confirmation', 'enrollment_confirmation', '<h2>Enrollment Confirmation</h2><p>This document confirms the student enrollment details recorded by the college.</p>', 1, '2026-11-06 05:30:00'),
(1002, 'Academic Progress Notice', 'academic_progress', '<h2>Academic Progress</h2><p>Please review the academic progress information provided in the student portal.</p>', 1, '2026-11-06 05:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `offering_id` bigint(20) UNSIGNED NOT NULL,
  `enrolled_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('enrolled','completed','withdrawn') NOT NULL DEFAULT 'enrolled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `offering_id`, `enrolled_at`, `status`) VALUES
(1, 11, 1, '2026-10-11 12:18:54', 'enrolled'),
(2, 11, 2, '2026-10-11 12:18:54', 'enrolled'),
(1001, 12, 11, '2026-09-16 09:00:00', 'enrolled'),
(1002, 13, 12, '2026-09-17 09:00:00', 'enrolled'),
(1003, 14, 13, '2026-09-18 09:00:00', 'enrolled'),
(1004, 15, 14, '2026-09-19 09:00:00', 'enrolled'),
(1005, 16, 15, '2026-09-20 09:00:00', 'enrolled'),
(1006, 17, 16, '2026-09-21 09:00:00', 'enrolled'),
(1007, 18, 17, '2026-09-22 09:00:00', 'enrolled'),
(1008, 19, 18, '2026-09-23 09:00:00', 'enrolled'),
(1009, 20, 19, '2026-09-24 09:00:00', 'enrolled'),
(1010, 21, 20, '2026-09-15 09:00:00', 'enrolled'),
(1011, 22, 11, '2026-09-16 09:00:00', 'enrolled'),
(1012, 23, 12, '2026-09-17 09:00:00', 'enrolled'),
(1013, 24, 13, '2026-09-18 09:00:00', 'enrolled'),
(1014, 25, 14, '2026-09-19 09:00:00', 'enrolled'),
(1015, 26, 15, '2026-09-20 09:00:00', 'enrolled'),
(1016, 27, 16, '2026-09-21 09:00:00', 'enrolled'),
(1017, 28, 17, '2026-09-22 09:00:00', 'enrolled'),
(1018, 29, 18, '2026-09-23 09:00:00', 'enrolled'),
(1019, 30, 19, '2026-09-24 09:00:00', 'enrolled'),
(1020, 31, 20, '2026-09-15 09:00:00', 'enrolled'),
(1021, 32, 11, '2026-09-16 09:00:00', 'enrolled'),
(1022, 33, 12, '2026-09-17 09:00:00', 'enrolled');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `summary` text DEFAULT NULL,
  `body` mediumtext DEFAULT NULL,
  `location` varchar(180) DEFAULT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('draft','published','cancelled') NOT NULL DEFAULT 'draft',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `slug`, `summary`, `body`, `location`, `starts_at`, `ends_at`, `image_url`, `status`, `created_by`, `created_at`) VALUES
(1, 'Academic Year Opening', 'academic-year-opening-2026', 'Opening of the academic year.', 'Orientation and academic year opening program.', 'College Main Hall', '2026-09-15 09:00:00', '2026-09-15 12:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(2, 'Student Orientation', 'student-orientation-2026', 'Orientation for new students.', 'Introduction to college services and expectations.', 'Main Hall', '2026-09-17 09:00:00', '2026-09-17 15:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(3, 'Workshop Safety Day', 'workshop-safety-day-2026', 'Safety induction for practical programs.', 'Workshop demonstrations and safety briefing.', 'Workshop Block', '2026-09-20 09:00:00', '2026-09-20 13:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(4, 'Library Introduction', 'library-introduction-2026', 'Introduction to library resources.', 'Students learn how to access study materials.', 'Library', '2026-09-22 10:00:00', '2026-09-22 12:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(5, 'ICT Lab Demonstration', 'ict-lab-demonstration-2026', 'Practical demonstration in the ICT lab.', 'Students explore computer lab facilities.', 'ICT Laboratory', '2026-09-25 10:00:00', '2026-09-25 12:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(6, 'Career Guidance Session', 'career-guidance-2026', 'Career planning and workplace readiness.', 'Guidance on career pathways and professional conduct.', 'Conference Room', '2026-10-10 09:00:00', '2026-10-10 12:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(7, 'Student Project Exhibition', 'student-project-exhibition-2026', 'Showcase of student practical projects.', 'Students present projects developed in their programs.', 'College Courtyard', '2026-11-10 09:00:00', '2026-11-10 15:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(8, 'Mid-semester Assessment Week', 'mid-semester-assessment-week-2026', 'Scheduled mid-semester assessments.', 'Assessment activities by department.', 'Classrooms and Workshops', '2026-11-16 08:00:00', '2026-11-20 17:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(9, 'Community Skills Day', 'community-skills-day-2026', 'Skills demonstrations for the community.', 'College departments demonstrate vocational skills.', 'College Campus', '2026-12-05 09:00:00', '2026-12-05 14:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(10, 'End of Semester Review', 'end-semester-review-2026', 'Semester review and student feedback.', 'Academic review and feedback activities.', 'Main Hall', '2026-12-18 09:00:00', '2026-12-18 12:00:00', NULL, 'published', 1, '2026-10-11 09:18:56'),
(1003, 'Semester One Review', 'semester-one-review-2026', 'A review of teaching, learning and student support.', 'Students and staff share feedback on the first semester.', 'Main Hall', '2026-12-18 09:00:00', '2026-12-18 15:00:00', NULL, 'published', 1, '2026-11-06 05:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `exam_schedules`
--

CREATE TABLE `exam_schedules` (
  `schedule_id` bigint(20) UNSIGNED NOT NULL,
  `assessment_id` bigint(20) UNSIGNED NOT NULL,
  `exam_date` date NOT NULL,
  `starts_at` time NOT NULL,
  `ends_at` time NOT NULL,
  `room_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invigilator_teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','postponed') NOT NULL DEFAULT 'scheduled',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `assessment_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `score` decimal(6,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `graded_at` datetime DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `workflow_status` enum('draft','submitted','under_review','approved','published','returned','corrected') NOT NULL DEFAULT 'draft',
  `submitted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `correction_reason` varchar(500) DEFAULT NULL,
  `locked_at` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `assessment_id`, `student_id`, `score`, `feedback`, `graded_by`, `graded_at`, `published`, `workflow_status`, `submitted_by`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `correction_reason`, `locked_at`) VALUES
(1, 1, 11, 88.00, 'Demonstration grade; review instructor feedback.', 1, '2026-10-11 12:18:55', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 3, 11, 90.00, 'Demonstration grade; review instructor feedback.', 1, '2026-10-11 12:18:55', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1001, 1001, 12, 78.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1002, 1002, 12, 87.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1003, 1003, 12, 96.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1004, 1004, 13, 85.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1005, 1005, 13, 94.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1006, 1006, 13, 66.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1007, 1007, 14, 92.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1008, 1008, 14, 64.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1009, 1009, 14, 73.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1010, 1010, 15, 62.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1011, 1011, 15, 71.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1012, 1012, 15, 80.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1013, 1013, 16, 69.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1014, 1014, 16, 78.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1015, 1015, 16, 87.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1016, 1016, 17, 76.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1017, 1017, 17, 85.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1018, 1018, 17, 94.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1019, 1019, 18, 83.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1020, 1020, 18, 92.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1021, 1021, 18, 64.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1022, 1022, 19, 90.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1023, 1023, 19, 62.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1024, 1024, 19, 71.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1025, 1025, 20, 97.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1026, 1026, 20, 69.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1027, 1027, 20, 78.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1028, 1028, 21, 67.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1029, 1029, 21, 76.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1030, 1030, 21, 85.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1031, 1001, 22, 74.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1032, 1002, 22, 83.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1033, 1003, 22, 92.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1034, 1004, 23, 81.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1035, 1005, 23, 90.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1036, 1006, 23, 62.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1037, 1007, 24, 88.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1038, 1008, 24, 97.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1039, 1009, 24, 69.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1040, 1010, 25, 95.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1041, 1011, 25, 67.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1042, 1012, 25, 76.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1043, 1013, 26, 65.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1044, 1014, 26, 74.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1045, 1015, 26, 83.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1046, 1016, 27, 72.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1047, 1017, 27, 81.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1048, 1018, 27, 90.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1049, 1019, 28, 79.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1050, 1020, 28, 88.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1051, 1021, 28, 97.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1052, 1022, 29, 86.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1053, 1023, 29, 95.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1054, 1024, 29, 67.00, 'Good progress. Review the practical feedback and continue practising.', 5, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1055, 1025, 30, 93.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1056, 1026, 30, 65.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1057, 1027, 30, 74.00, 'Good progress. Review the practical feedback and continue practising.', 6, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1058, 1028, 31, 63.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1059, 1029, 31, 72.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1060, 1030, 31, 81.00, 'Good progress. Review the practical feedback and continue practising.', 7, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1061, 1001, 32, 70.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1062, 1002, 32, 79.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1063, 1003, 32, 88.00, 'Good progress. Review the practical feedback and continue practising.', 3, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1064, 1004, 33, 77.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1065, 1005, 33, 86.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1066, 1006, 33, 95.00, 'Good progress. Review the practical feedback and continue practising.', 4, '2026-11-05 15:00:00', 1, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `grade_correction_history`
--

CREATE TABLE `grade_correction_history` (
  `correction_id` bigint(20) UNSIGNED NOT NULL,
  `grade_id` bigint(20) UNSIGNED NOT NULL,
  `old_score` decimal(6,2) DEFAULT NULL,
  `new_score` decimal(6,2) DEFAULT NULL,
  `old_feedback` text DEFAULT NULL,
  `new_feedback` text DEFAULT NULL,
  `correction_reason` varchar(500) NOT NULL,
  `corrected_by` bigint(20) UNSIGNED NOT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `corrected_at` datetime NOT NULL DEFAULT current_timestamp(),
  `approved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grade_lock_history`
--

CREATE TABLE `grade_lock_history` (
  `lock_id` bigint(20) UNSIGNED NOT NULL,
  `grade_id` bigint(20) UNSIGNED NOT NULL,
  `locked_by` bigint(20) UNSIGNED NOT NULL,
  `locked_at` datetime NOT NULL DEFAULT current_timestamp(),
  `reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grade_lock_history`
--

INSERT INTO `grade_lock_history` (`lock_id`, `grade_id`, `locked_by`, `locked_at`, `reason`) VALUES
(1001, 1001, 1, '2026-11-06 10:00:00', 'Demo record: grade approved and locked by academic administration.'),
(1002, 1004, 1, '2026-11-06 10:05:00', 'Demo record: grade approved and locked by academic administration.');

-- --------------------------------------------------------

--
-- Table structure for table `grade_publish_events`
--

CREATE TABLE `grade_publish_events` (
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `published_at` datetime NOT NULL DEFAULT current_timestamp(),
  `semester_id` bigint(20) UNSIGNED DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grade_publish_events`
--

INSERT INTO `grade_publish_events` (`event_id`, `course_id`, `teacher_id`, `published_at`, `semester_id`, `details`) VALUES
(1001, 1, 3, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1002, 2, 4, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1003, 3, 5, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1004, 4, 6, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1005, 5, 7, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1006, 6, 3, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1007, 7, 4, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1008, 8, 5, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1009, 9, 6, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}'),
(1010, 10, 7, '2026-11-05 15:00:00', 1, '{\"published_by\":\"demo teacher\",\"section\":\"B\"}');

-- --------------------------------------------------------

--
-- Table structure for table `grading_scales`
--

CREATE TABLE `grading_scales` (
  `scale_id` bigint(20) UNSIGNED NOT NULL,
  `scale_name` varchar(100) NOT NULL,
  `max_gpa` decimal(4,2) NOT NULL DEFAULT 4.00,
  `is_default` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grading_scale_rules`
--

CREATE TABLE `grading_scale_rules` (
  `rule_id` bigint(20) UNSIGNED NOT NULL,
  `scale_id` bigint(20) UNSIGNED NOT NULL,
  `minimum_score` decimal(5,2) NOT NULL,
  `maximum_score` decimal(5,2) NOT NULL,
  `letter_grade` varchar(5) NOT NULL,
  `grade_point` decimal(4,2) NOT NULL,
  `is_pass` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `library_items`
--

CREATE TABLE `library_items` (
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `accession_number` varchar(60) NOT NULL,
  `isbn` varchar(30) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `author` varchar(180) DEFAULT NULL,
  `publisher` varchar(180) DEFAULT NULL,
  `publication_year` smallint(5) UNSIGNED DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `item_type` enum('book','journal','manual','reference','digital','other') NOT NULL DEFAULT 'book',
  `shelf_location` varchar(100) DEFAULT NULL,
  `total_copies` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `available_copies` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `status` enum('active','withdrawn','lost') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `library_loans`
--

CREATE TABLE `library_loans` (
  `loan_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `borrower_user_id` bigint(20) UNSIGNED NOT NULL,
  `issued_by` bigint(20) UNSIGNED NOT NULL,
  `issued_at` datetime NOT NULL DEFAULT current_timestamp(),
  `due_at` datetime NOT NULL,
  `returned_at` datetime DEFAULT NULL,
  `received_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('issued','returned','overdue','lost') NOT NULL DEFAULT 'issued',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `news_articles`
--

CREATE TABLE `news_articles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `summary` text DEFAULT NULL,
  `body` mediumtext NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `author_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `news_articles`
--

INSERT INTO `news_articles` (`id`, `title`, `slug`, `summary`, `body`, `image_url`, `status`, `published_at`, `author_id`, `created_at`) VALUES
(1, 'College Opens the 2026/2027 Academic Year', 'college-opens-2026-2027', 'The college welcomes students for the new academic year.', 'Saint Anthony’s Technical and Vocational College welcomes students and staff to the new academic year.', NULL, 'published', '2026-09-15 08:00:00', 1, '2026-10-11 09:18:56'),
(2, 'New Student Orientation Completed', 'new-student-orientation-completed', 'New students were introduced to college services.', 'Orientation covered academic expectations, support services and workshop safety.', NULL, 'published', '2026-09-18 08:00:00', 1, '2026-10-11 09:18:56'),
(3, 'Workshop Safety Training Begins', 'workshop-safety-training-begins', 'Practical safety training is underway.', 'Departments are conducting safety inductions before practical training.', NULL, 'published', '2026-09-21 08:00:00', 1, '2026-10-11 09:18:56'),
(4, 'Library Resources Updated', 'library-resources-updated', 'Additional learning resources are available.', 'The library resource list has been updated for students and instructors.', NULL, 'published', '2026-09-27 08:00:00', 1, '2026-10-11 09:18:56'),
(5, 'ICT Laboratory Supports Practical Learning', 'ict-lab-practical-learning', 'ICT students are developing practical computer skills.', 'Laboratory activities support computer maintenance and networking practice.', NULL, 'published', '2026-10-01 08:00:00', 1, '2026-10-11 09:18:56'),
(6, 'Admissions Office Shares Application Guidance', 'admissions-application-guidance', 'Prospective students can request program information.', 'The admissions office provides information about available programs and application steps.', NULL, 'published', '2026-10-03 08:00:00', 1, '2026-10-11 09:18:56'),
(7, 'Teachers Coordinate Semester Assessments', 'teachers-coordinate-assessments', 'Departments are coordinating assessment schedules.', 'Teaching staff are aligning assessment schedules and communicating dates to students.', NULL, 'published', '2026-10-05 08:00:00', 1, '2026-10-11 09:18:56'),
(8, 'Students Prepare Practical Projects', 'students-prepare-practical-projects', 'Students are working on applied projects.', 'Practical projects help students demonstrate occupational competencies.', '/images/news/projects.jpg', 'published', '2026-10-07 08:00:00', 1, '2026-10-11 09:18:56'),
(9, 'College Emphasizes Attendance and Participation', 'college-attendance-participation', 'Regular attendance supports learning progress.', 'Students are reminded to attend lessons and practical sessions consistently.', '/images/news/attendance.jpg', 'published', '2026-10-09 08:00:00', 1, '2026-10-11 09:18:56'),
(10, 'Mid-semester Assessment Schedule Published', 'mid-semester-assessment-schedule', 'Students should review the upcoming assessment schedule.', 'Students should confirm dates with instructors and prepare for scheduled assessments.', '/images/news/assessment.jpg', 'published', '2026-10-10 08:00:00', 1, '2026-10-11 09:18:56'),
(1001, 'Students Build Practical Skills Through Workshop Learning', 'students-build-practical-skills', 'Workshop sessions connect classroom learning with practical tasks.', 'Students across the college are developing occupational skills through guided workshop activities. Instructors emphasize safe tool use, teamwork and careful documentation.', NULL, 'published', '2026-11-06 08:00:00', 1, '2026-11-06 05:30:00'),
(1002, 'College Prepares for Community Skills Day', 'college-prepares-community-skills-day', 'Departments are preparing demonstrations for the local community.', 'The upcoming community skills day will provide an opportunity for students and instructors to share practical knowledge with visitors.', NULL, 'published', '2026-11-06 08:00:00', 1, '2026-11-06 05:30:00'),
(1003, 'Library Supports Independent Study', 'library-supports-independent-study', 'Students can use library materials to support their coursework.', 'The college library provides a quiet study environment and access to learning materials that complement classroom and workshop instruction.', NULL, 'published', '2026-11-06 08:00:00', 1, '2026-11-06 05:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','urgent') NOT NULL DEFAULT 'info',
  `link_url` varchar(500) DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `link_url`, `read_at`, `created_at`) VALUES
(1001, 1001, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1002, 1002, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1003, 1003, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1004, 1004, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1005, 1005, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1006, 1006, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1007, 1007, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1008, 1008, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1009, 1009, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1010, 1010, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1011, 1011, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1012, 1012, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1013, 1013, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1014, 1014, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1015, 1015, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1016, 1016, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1017, 1017, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1018, 1018, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1019, 1019, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1020, 1020, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1021, 1021, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1022, 1022, 'Assessment information updated', 'Your course assessment plan is available in the student portal.', 'info', '/student/assessments', NULL, '2026-11-06 06:30:00'),
(1101, 1, 'Demo data imported', 'The demonstration dataset has been added to the college database.', 'success', '/admin', NULL, '2026-11-06 06:30:00'),
(1102, 7, 'Department coordination', 'Please review your assigned course offerings and timetable.', 'info', '/teacher/courses', NULL, '2026-11-06 06:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `permission_code` varchar(140) NOT NULL,
  `resource` varchar(80) NOT NULL,
  `action` varchar(40) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_code`, `resource`, `action`, `description`, `created_at`) VALUES
(1, 'admissions.review', 'admissions', 'review', NULL, '2026-11-09 08:29:33'),
(2, 'announcements.publish', 'announcements', 'publish', NULL, '2026-11-09 08:29:33'),
(3, 'grades.delete', 'grades', 'delete', NULL, '2026-11-09 08:29:33'),
(4, 'grades.update', 'grades', 'update', NULL, '2026-11-09 08:29:33'),
(5, 'programs.create', 'programs', 'create', NULL, '2026-11-09 08:29:33'),
(6, 'programs.delete', 'programs', 'delete', NULL, '2026-11-09 08:29:33'),
(7, 'reports.view', 'reports', 'view', NULL, '2026-11-09 08:29:33'),
(8, 'students.create', 'students', 'create', NULL, '2026-11-09 08:29:33'),
(9, 'students.delete', 'students', 'delete', NULL, '2026-11-09 08:29:33'),
(10, 'teachers.create', 'teachers', 'create', NULL, '2026-11-09 08:29:33'),
(11, 'teachers.delete', 'teachers', 'delete', NULL, '2026-11-09 08:29:33'),
(12, 'assignments.submit', 'assignments', 'submit', NULL, '2026-11-09 08:29:33'),
(13, 'attendance.view', 'attendance', 'view', NULL, '2026-11-09 08:29:33'),
(14, 'grades.view', 'grades', 'view', NULL, '2026-11-09 08:29:33'),
(15, 'assignments.create', 'assignments', 'create', NULL, '2026-11-09 08:29:33'),
(16, 'attendance.create', 'attendance', 'create', NULL, '2026-11-09 08:29:33'),
(17, 'attendance.update', 'attendance', 'update', NULL, '2026-11-09 08:29:33'),
(18, 'courses.view', 'courses', 'view', NULL, '2026-11-09 08:29:33'),
(32, 'dashboard.view', 'dashboard', 'view', NULL, '2026-11-09 08:29:33'),
(33, 'users.view', 'users', 'view', NULL, '2026-11-09 08:29:33'),
(34, 'users.create', 'users', 'create', NULL, '2026-11-09 08:29:33'),
(35, 'users.update', 'users', 'update', NULL, '2026-11-09 08:29:33'),
(36, 'users.deactivate', 'users', 'deactivate', NULL, '2026-11-09 08:29:33'),
(37, 'roles.view', 'roles', 'view', NULL, '2026-11-09 08:29:33'),
(38, 'roles.manage', 'roles', 'manage', NULL, '2026-11-09 08:29:33'),
(39, 'students.view', 'students', 'view', NULL, '2026-11-09 08:29:33'),
(40, 'students.update', 'students', 'update', NULL, '2026-11-09 08:29:33'),
(41, 'students.archive', 'students', 'archive', NULL, '2026-11-09 08:29:33'),
(42, 'admissions.view', 'admissions', 'view', NULL, '2026-11-09 08:29:33'),
(43, 'admissions.manage', 'admissions', 'manage', NULL, '2026-11-09 08:29:33'),
(44, 'teachers.view', 'teachers', 'view', NULL, '2026-11-09 08:29:33'),
(45, 'teachers.manage', 'teachers', 'manage', NULL, '2026-11-09 08:29:33'),
(46, 'departments.view', 'departments', 'view', NULL, '2026-11-09 08:29:33'),
(47, 'departments.manage', 'departments', 'manage', NULL, '2026-11-09 08:29:33'),
(48, 'programs.view', 'programs', 'view', NULL, '2026-11-09 08:29:33'),
(49, 'programs.manage', 'programs', 'manage', NULL, '2026-11-09 08:29:33'),
(50, 'courses.manage', 'courses', 'manage', NULL, '2026-11-09 08:29:33'),
(51, 'offerings.view', 'offerings', 'view', NULL, '2026-11-09 08:29:33'),
(52, 'offerings.manage', 'offerings', 'manage', NULL, '2026-11-09 08:29:33'),
(53, 'enrollments.view', 'enrollments', 'view', NULL, '2026-11-09 08:29:33'),
(54, 'enrollments.manage', 'enrollments', 'manage', NULL, '2026-11-09 08:29:33'),
(55, 'attendance.record', 'attendance', 'record', NULL, '2026-11-09 08:29:33'),
(56, 'attendance.correct', 'attendance', 'correct', NULL, '2026-11-09 08:29:33'),
(57, 'assessments.view', 'assessments', 'view', NULL, '2026-11-09 08:29:33'),
(58, 'assessments.manage', 'assessments', 'manage', NULL, '2026-11-09 08:29:33'),
(59, 'grades.enter', 'grades', 'enter', NULL, '2026-11-09 08:29:33'),
(60, 'grades.submit', 'grades', 'submit', NULL, '2026-11-09 08:29:33'),
(61, 'grades.review', 'grades', 'review', NULL, '2026-11-09 08:29:33'),
(62, 'grades.approve', 'grades', 'approve', NULL, '2026-11-09 08:29:33'),
(63, 'grades.publish', 'grades', 'publish', NULL, '2026-11-09 08:29:33'),
(64, 'grades.correct', 'grades', 'correct', NULL, '2026-11-09 08:29:33'),
(65, 'timetable.view', 'timetable', 'view', NULL, '2026-11-09 08:29:33'),
(66, 'timetable.manage', 'timetable', 'manage', NULL, '2026-11-09 08:29:33'),
(67, 'rooms.view', 'rooms', 'view', NULL, '2026-11-09 08:29:33'),
(68, 'rooms.manage', 'rooms', 'manage', NULL, '2026-11-09 08:29:33'),
(69, 'library.view', 'library', 'view', NULL, '2026-11-09 08:29:33'),
(70, 'library.manage', 'library', 'manage', NULL, '2026-11-09 08:29:33'),
(71, 'library.circulate', 'library', 'circulate', NULL, '2026-11-09 08:29:33'),
(72, 'resources.view', 'resources', 'view', NULL, '2026-11-09 08:29:33'),
(73, 'resources.manage', 'resources', 'manage', NULL, '2026-11-09 08:29:33'),
(74, 'announcements.view', 'announcements', 'view', NULL, '2026-11-09 08:29:33'),
(75, 'announcements.manage', 'announcements', 'manage', NULL, '2026-11-09 08:29:33'),
(76, 'reports.export', 'reports', 'export', NULL, '2026-11-09 08:29:33'),
(77, 'imports.view', 'imports', 'view', NULL, '2026-11-09 08:29:33'),
(78, 'imports.execute', 'imports', 'execute', NULL, '2026-11-09 08:29:33'),
(79, 'audit.view', 'audit', 'view', NULL, '2026-11-09 08:29:33'),
(80, 'student_services.view', 'student_services', 'view', NULL, '2026-11-09 08:29:33'),
(81, 'student_services.manage', 'student_services', 'manage', NULL, '2026-11-09 08:29:33');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(30) NOT NULL,
  `name` varchar(150) NOT NULL,
  `department` varchar(150) DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `qualification_level` varchar(80) NOT NULL DEFAULT 'Level I',
  `duration_years` tinyint(3) UNSIGNED NOT NULL DEFAULT 2,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`id`, `code`, `name`, `department`, `department_id`, `qualification_level`, `duration_years`, `description`, `is_active`, `created_at`, `image_url`) VALUES
(1, 'ELI', 'Electrical Installation', 'Electrical Technology', NULL, 'Level I-IV', 2, 'Electrical installation, safety, testing and maintenance.', 1, '2026-10-11 09:14:17', '/images/programs/Einstallation.jpg'),
(2, 'ICT', 'Information Technology', 'ICT', NULL, 'Level I-IV', 2, 'Computer systems, networking, software and support.', 1, '2026-10-11 09:14:17', '/images/programs/computer-science.jpg'),
(3, 'AUT', 'Automotive Technology', 'Automotive', NULL, 'Level I-IV', 2, 'Vehicle servicing, diagnostics and repair.', 1, '2026-10-11 09:14:17', '/images/programs/automotive.jpg'),
(4, 'CON', 'Construction Technology', 'Construction', NULL, 'Level I-IV', 2, 'Construction methods, materials and site practice.', 1, '2026-10-11 09:14:17', '/images/programs/engineering.jpg'),
(5, 'WLD', 'Welding Technology', 'Manufacturing', NULL, 'Level I-IV', 2, 'Workshop welding, fabrication and safety.', 1, '2026-10-11 09:14:17', '/images/programs/welding.jpg'),
(6, 'PLB', 'Plumbing', 'Building Services', NULL, 'Level I-III', 2, 'Water supply, drainage and plumbing systems.', 1, '2026-10-11 09:14:17', '/images/programs/plumbing.jpg'),
(7, 'REF', 'Refrigeration and Air Conditioning', 'Building Services', NULL, 'Level I-IV', 2, 'Cooling systems installation and maintenance.', 1, '2026-10-11 09:14:17', 'https://images.unsplash.com/...default.jpg?...'),
(8, 'ACC', 'Accounting', 'Business', NULL, 'Level I-IV', 2, 'Bookkeeping, accounting software and reporting.', 1, '2026-10-11 09:14:17', '/images/programs/business.jpg'),
(9, 'MEC', 'General Mechanics', 'Manufacturing', NULL, 'Level I-IV', 2, 'Mechanical workshop and maintenance skills.', 1, '2026-10-11 09:14:17', '/images/programs/mechanic.jpg'),
(10, 'HOT', 'Hospitality Operations', 'Hospitality', NULL, 'Level I-III', 2, 'Food service, customer care and hospitality practice.', 1, '2026-10-11 09:14:17', '/images/programs/hospitality.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('form','calendar','policy','learning_material','student_guide','other') NOT NULL DEFAULT 'other',
  `file_url` varchar(500) DEFAULT NULL,
  `audience` enum('public','students','teachers','staff') NOT NULL DEFAULT 'public',
  `published` tinyint(1) NOT NULL DEFAULT 1,
  `uploaded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`id`, `title`, `description`, `category`, `file_url`, `audience`, `published`, `uploaded_by`, `created_at`) VALUES
(1, 'Academic Calendar 2026/2027', 'Key dates for the academic year.', 'calendar', '/uploads/resources/academic-calendar-2026-2027.pdf', 'public', 1, 1, '2026-10-11 09:18:56'),
(2, 'Student Handbook', 'College policies, services and student responsibilities.', 'student_guide', '/uploads/resources/student-handbook.pdf', 'students', 1, 1, '2026-10-11 09:18:56'),
(3, 'Admissions Application Form', 'Application form for prospective students.', 'form', '/uploads/resources/admissions-form.pdf', 'public', 1, 1, '2026-10-11 09:18:56'),
(4, 'Workshop Safety Guide', 'Basic safety requirements for workshops.', 'policy', '/uploads/resources/workshop-safety.pdf', 'students', 1, 1, '2026-10-11 09:18:56'),
(5, 'Assessment and Grading Policy', 'Assessment rules and grading information.', 'policy', '/uploads/resources/assessment-policy.pdf', 'students', 1, 1, '2026-10-11 09:18:56'),
(6, 'Teacher Course Guide', 'Guidance for course delivery and assessment.', 'other', '/uploads/resources/teacher-course-guide.pdf', 'teachers', 1, 1, '2026-10-11 09:18:56'),
(7, 'ICT Laboratory Rules', 'Rules for safe and appropriate ICT lab use.', 'policy', '/uploads/resources/ict-lab-rules.pdf', 'students', 1, 1, '2026-10-11 09:18:56'),
(8, 'Library User Guide', 'How to access library and learning resources.', 'student_guide', '/uploads/resources/library-guide.pdf', 'public', 1, 1, '2026-10-11 09:18:56'),
(9, 'Student Clearance Form', 'Form for the student clearance process.', 'form', '/uploads/resources/clearance-form.pdf', 'students', 1, 1, '2026-10-11 09:18:56'),
(10, 'Practical Training Logbook', 'Template for documenting practical training.', 'learning_material', '/uploads/resources/training-logbook.pdf', 'students', 1, 1, '2026-10-11 09:18:56'),
(1001, 'Student Assessment Guide', 'Overview of assessment types, weighting and feedback.', 'student_guide', '/demo/resources/student-assessment-guide.pdf', 'students', 1, 1, '2026-11-06 05:30:00'),
(1002, 'Workshop Safety Checklist', 'Checklist for safe conduct in practical workshops.', 'policy', '/demo/resources/workshop-safety-checklist.pdf', 'students', 1, 1, '2026-11-06 05:30:00'),
(1003, 'Teacher Lesson Plan Template', 'Template for weekly lesson preparation.', 'learning_material', '/demo/resources/lesson-plan-template.docx', 'teachers', 1, 1, '2026-11-06 05:30:00'),
(1004, 'Student Registration Form', 'Demonstration registration form.', 'form', '/demo/resources/student-registration-form.pdf', 'public', 1, 1, '2026-11-06 05:30:00'),
(1005, 'Academic Calendar Summary', 'Important academic dates for 2026/2027.', 'calendar', '/demo/resources/academic-calendar-summary.pdf', 'public', 1, 1, '2026-11-06 05:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `result_approval_batches`
--

CREATE TABLE `result_approval_batches` (
  `approval_batch_id` bigint(20) UNSIGNED NOT NULL,
  `offering_id` bigint(20) UNSIGNED NOT NULL,
  `submitted_by` bigint(20) UNSIGNED NOT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `status` enum('submitted','under_review','approved','returned','published') NOT NULL DEFAULT 'submitted',
  `reviewer_notes` text DEFAULT NULL,
  `published_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result_approval_items`
--

CREATE TABLE `result_approval_items` (
  `approval_item_id` bigint(20) UNSIGNED NOT NULL,
  `approval_batch_id` bigint(20) UNSIGNED NOT NULL,
  `grade_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `role_code` varchar(50) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system_role` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_code`, `role_name`, `description`, `is_system_role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Administrator', 'System-wide administration.', 1, 1, '2026-11-09 08:29:33', '2026-11-09 08:29:33'),
(2, 'teacher', 'Teacher', 'Teaching, attendance and assessment.', 1, 1, '2026-11-09 08:29:33', '2026-11-09 08:29:33'),
(3, 'student', 'Student', 'Student portal and own academic records.', 1, 1, '2026-11-09 08:29:33', '2026-11-09 08:29:33'),
(4, 'registrar', 'Registrar', 'Student records, enrollment and academic records.', 0, 1, '2026-11-09 08:29:33', '2026-11-09 08:29:33'),
(5, 'librarian', 'Librarian', 'Library catalog and circulation.', 0, 1, '2026-11-09 08:29:33', '2026-11-09 08:29:33'),
(6, 'department_head', 'Department Head', 'Department-level academic oversight.', 0, 1, '2026-11-09 08:29:33', '2026-11-09 08:29:33'),
(7, 'admissions_officer', 'Admissions Officer', 'Applicant review and admission processing.', 0, 1, '2026-11-09 08:29:33', '2026-11-09 08:29:33'),
(8, 'academic_coordinator', 'Academic Coordinator', 'Academic operations and coordination.', 0, 1, '2026-11-09 08:29:33', '2026-11-09 08:29:33');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_name` varchar(30) NOT NULL,
  `resource` varchar(80) NOT NULL,
  `action` varchar(40) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`permission_id`, `role_name`, `resource`, `action`, `created_at`) VALUES
(1, 'admin', 'students', 'create', '2026-11-05 14:25:54'),
(2, 'admin', 'students', 'delete', '2026-11-05 14:25:54'),
(3, 'admin', 'teachers', 'create', '2026-11-05 14:25:54'),
(4, 'admin', 'teachers', 'delete', '2026-11-05 14:25:54'),
(5, 'admin', 'programs', 'create', '2026-11-05 14:25:54'),
(6, 'admin', 'programs', 'delete', '2026-11-05 14:25:54'),
(7, 'admin', 'grades', 'update', '2026-11-05 14:25:54'),
(8, 'admin', 'grades', 'delete', '2026-11-05 14:25:54'),
(9, 'teacher', 'grades', 'update', '2026-11-05 14:25:54'),
(10, 'teacher', 'grades', 'delete', '2026-11-05 14:25:54'),
(11, 'teacher', 'attendance', 'update', '2026-11-05 14:25:54'),
(1001, 'admin', 'announcements', 'publish', '2026-11-06 05:30:00'),
(1002, 'admin', 'admissions', 'review', '2026-11-06 05:30:00'),
(1003, 'admin', 'reports', 'view', '2026-11-06 05:30:00'),
(1004, 'teacher', 'assignments', 'create', '2026-11-06 05:30:00'),
(1005, 'teacher', 'attendance', 'create', '2026-11-06 05:30:00'),
(1006, 'teacher', 'courses', 'view', '2026-11-06 05:30:00'),
(1007, 'student', 'grades', 'view', '2026-11-06 05:30:00'),
(1008, 'student', 'attendance', 'view', '2026-11-06 05:30:00'),
(1009, 'student', 'assignments', 'submit', '2026-11-06 05:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission_map`
--

CREATE TABLE `role_permission_map` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permission_map`
--

INSERT INTO `role_permission_map` (`role_id`, `permission_id`, `created_at`) VALUES
(1, 1, '2026-11-09 08:29:34'),
(1, 2, '2026-11-09 08:29:34'),
(1, 3, '2026-11-09 08:29:34'),
(1, 4, '2026-11-09 08:29:34'),
(1, 5, '2026-11-09 08:29:34'),
(1, 6, '2026-11-09 08:29:34'),
(1, 7, '2026-11-09 08:29:34'),
(1, 8, '2026-11-09 08:29:34'),
(1, 9, '2026-11-09 08:29:34'),
(1, 10, '2026-11-09 08:29:34'),
(1, 11, '2026-11-09 08:29:34'),
(1, 12, '2026-11-09 08:29:34'),
(1, 13, '2026-11-09 08:29:34'),
(1, 14, '2026-11-09 08:29:34'),
(1, 15, '2026-11-09 08:29:34'),
(1, 16, '2026-11-09 08:29:34'),
(1, 17, '2026-11-09 08:29:34'),
(1, 18, '2026-11-09 08:29:34'),
(1, 32, '2026-11-09 08:29:34'),
(1, 33, '2026-11-09 08:29:34'),
(1, 34, '2026-11-09 08:29:34'),
(1, 35, '2026-11-09 08:29:34'),
(1, 36, '2026-11-09 08:29:34'),
(1, 37, '2026-11-09 08:29:34'),
(1, 38, '2026-11-09 08:29:34'),
(1, 39, '2026-11-09 08:29:34'),
(1, 40, '2026-11-09 08:29:34'),
(1, 41, '2026-11-09 08:29:34'),
(1, 42, '2026-11-09 08:29:34'),
(1, 43, '2026-11-09 08:29:34'),
(1, 44, '2026-11-09 08:29:34'),
(1, 45, '2026-11-09 08:29:34'),
(1, 46, '2026-11-09 08:29:34'),
(1, 47, '2026-11-09 08:29:34'),
(1, 48, '2026-11-09 08:29:34'),
(1, 49, '2026-11-09 08:29:34'),
(1, 50, '2026-11-09 08:29:34'),
(1, 51, '2026-11-09 08:29:34'),
(1, 52, '2026-11-09 08:29:34'),
(1, 53, '2026-11-09 08:29:34'),
(1, 54, '2026-11-09 08:29:34'),
(1, 55, '2026-11-09 08:29:34'),
(1, 56, '2026-11-09 08:29:34'),
(1, 57, '2026-11-09 08:29:34'),
(1, 58, '2026-11-09 08:29:34'),
(1, 59, '2026-11-09 08:29:34'),
(1, 60, '2026-11-09 08:29:34'),
(1, 61, '2026-11-09 08:29:34'),
(1, 62, '2026-11-09 08:29:34'),
(1, 63, '2026-11-09 08:29:34'),
(1, 64, '2026-11-09 08:29:34'),
(1, 65, '2026-11-09 08:29:34'),
(1, 66, '2026-11-09 08:29:34'),
(1, 67, '2026-11-09 08:29:34'),
(1, 68, '2026-11-09 08:29:34'),
(1, 69, '2026-11-09 08:29:34'),
(1, 70, '2026-11-09 08:29:34'),
(1, 71, '2026-11-09 08:29:34'),
(1, 72, '2026-11-09 08:29:34'),
(1, 73, '2026-11-09 08:29:34'),
(1, 74, '2026-11-09 08:29:34'),
(1, 75, '2026-11-09 08:29:34'),
(1, 76, '2026-11-09 08:29:34'),
(1, 77, '2026-11-09 08:29:34'),
(1, 78, '2026-11-09 08:29:34'),
(1, 79, '2026-11-09 08:29:34'),
(1, 80, '2026-11-09 08:29:34'),
(1, 81, '2026-11-09 08:29:34'),
(2, 3, '2026-11-09 08:29:34'),
(2, 4, '2026-11-09 08:29:34'),
(2, 12, '2026-11-09 08:29:34'),
(2, 13, '2026-11-09 08:29:34'),
(2, 14, '2026-11-09 08:29:34'),
(2, 15, '2026-11-09 08:29:34'),
(2, 16, '2026-11-09 08:29:34'),
(2, 17, '2026-11-09 08:29:34'),
(2, 18, '2026-11-09 08:29:34'),
(2, 32, '2026-11-09 08:29:34'),
(2, 39, '2026-11-09 08:29:34'),
(2, 51, '2026-11-09 08:29:34'),
(2, 52, '2026-11-09 08:29:34'),
(2, 55, '2026-11-09 08:29:34'),
(2, 57, '2026-11-09 08:29:34'),
(2, 58, '2026-11-09 08:29:34'),
(2, 59, '2026-11-09 08:29:34'),
(2, 60, '2026-11-09 08:29:34'),
(2, 65, '2026-11-09 08:29:34'),
(2, 66, '2026-11-09 08:29:34'),
(2, 72, '2026-11-09 08:29:34'),
(2, 73, '2026-11-09 08:29:34'),
(3, 12, '2026-11-09 08:29:34'),
(3, 13, '2026-11-09 08:29:34'),
(3, 14, '2026-11-09 08:29:34'),
(4, 1, '2026-11-09 08:29:34'),
(4, 5, '2026-11-09 08:29:34'),
(4, 7, '2026-11-09 08:29:34'),
(4, 8, '2026-11-09 08:29:34'),
(4, 18, '2026-11-09 08:29:34'),
(4, 32, '2026-11-09 08:29:34'),
(4, 39, '2026-11-09 08:29:34'),
(4, 40, '2026-11-09 08:29:34'),
(4, 42, '2026-11-09 08:29:34'),
(4, 43, '2026-11-09 08:29:34'),
(4, 48, '2026-11-09 08:29:34'),
(4, 49, '2026-11-09 08:29:34'),
(4, 50, '2026-11-09 08:29:34'),
(4, 51, '2026-11-09 08:29:34'),
(4, 52, '2026-11-09 08:29:34'),
(4, 53, '2026-11-09 08:29:34'),
(4, 54, '2026-11-09 08:29:34'),
(4, 76, '2026-11-09 08:29:34'),
(4, 77, '2026-11-09 08:29:34'),
(4, 78, '2026-11-09 08:29:34'),
(5, 32, '2026-11-09 08:29:34'),
(5, 39, '2026-11-09 08:29:34'),
(5, 69, '2026-11-09 08:29:34'),
(5, 70, '2026-11-09 08:29:34'),
(5, 71, '2026-11-09 08:29:34'),
(5, 72, '2026-11-09 08:29:34'),
(5, 73, '2026-11-09 08:29:34'),
(6, 7, '2026-11-09 08:29:34'),
(6, 13, '2026-11-09 08:29:34'),
(6, 14, '2026-11-09 08:29:34'),
(6, 18, '2026-11-09 08:29:34'),
(6, 32, '2026-11-09 08:29:34'),
(6, 39, '2026-11-09 08:29:34'),
(6, 44, '2026-11-09 08:29:34'),
(6, 45, '2026-11-09 08:29:34'),
(6, 46, '2026-11-09 08:29:34'),
(6, 47, '2026-11-09 08:29:34'),
(6, 48, '2026-11-09 08:29:34'),
(6, 49, '2026-11-09 08:29:34'),
(6, 50, '2026-11-09 08:29:34'),
(6, 51, '2026-11-09 08:29:34'),
(6, 52, '2026-11-09 08:29:34'),
(6, 57, '2026-11-09 08:29:34'),
(6, 58, '2026-11-09 08:29:34'),
(6, 61, '2026-11-09 08:29:34'),
(6, 62, '2026-11-09 08:29:34'),
(6, 65, '2026-11-09 08:29:34'),
(6, 66, '2026-11-09 08:29:34'),
(6, 76, '2026-11-09 08:29:34'),
(7, 1, '2026-11-09 08:29:34'),
(7, 7, '2026-11-09 08:29:34'),
(7, 8, '2026-11-09 08:29:34'),
(7, 32, '2026-11-09 08:29:34'),
(7, 39, '2026-11-09 08:29:34'),
(7, 40, '2026-11-09 08:29:34'),
(7, 42, '2026-11-09 08:29:34'),
(7, 76, '2026-11-09 08:29:34'),
(8, 7, '2026-11-09 08:29:34'),
(8, 13, '2026-11-09 08:29:34'),
(8, 14, '2026-11-09 08:29:34'),
(8, 18, '2026-11-09 08:29:34'),
(8, 32, '2026-11-09 08:29:34'),
(8, 46, '2026-11-09 08:29:34'),
(8, 47, '2026-11-09 08:29:34'),
(8, 48, '2026-11-09 08:29:34'),
(8, 49, '2026-11-09 08:29:34'),
(8, 50, '2026-11-09 08:29:34'),
(8, 51, '2026-11-09 08:29:34'),
(8, 52, '2026-11-09 08:29:34'),
(8, 53, '2026-11-09 08:29:34'),
(8, 54, '2026-11-09 08:29:34'),
(8, 57, '2026-11-09 08:29:34'),
(8, 58, '2026-11-09 08:29:34'),
(8, 61, '2026-11-09 08:29:34'),
(8, 62, '2026-11-09 08:29:34'),
(8, 63, '2026-11-09 08:29:34'),
(8, 65, '2026-11-09 08:29:34'),
(8, 66, '2026-11-09 08:29:34'),
(8, 67, '2026-11-09 08:29:34'),
(8, 68, '2026-11-09 08:29:34'),
(8, 76, '2026-11-09 08:29:34');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `room_code` varchar(40) NOT NULL,
  `room_name` varchar(120) NOT NULL,
  `room_type` enum('classroom','workshop','laboratory','office','hall','library','other') NOT NULL DEFAULT 'classroom',
  `building` varchar(120) DEFAULT NULL,
  `floor_label` varchar(40) DEFAULT NULL,
  `capacity` smallint(5) UNSIGNED DEFAULT NULL,
  `status` enum('available','unavailable','maintenance') NOT NULL DEFAULT 'available',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_booking_exceptions`
--

CREATE TABLE `room_booking_exceptions` (
  `exception_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `booking_date` date NOT NULL,
  `starts_at` time NOT NULL,
  `ends_at` time NOT NULL,
  `exception_type` enum('blocked','maintenance','event','other') NOT NULL DEFAULT 'blocked',
  `reason` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `name` varchar(190) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `academic_year_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `starts_on` date NOT NULL,
  `ends_on` date NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0
) ;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`id`, `academic_year_id`, `name`, `starts_on`, `ends_on`, `is_current`) VALUES
(1, 1, 'Semester 1', '2026-09-01', '2027-01-31', 1),
(2, 1, 'Semester 2', '2027-02-01', '2027-06-30', 0);

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES
('academic_year', '2026/2027', '2026-10-11 09:18:56'),
('address', 'Hossana, Ethiopia', '2026-10-11 09:18:56'),
('college_name', 'Saint Anthony\'s Technical and Vocational College', '2026-10-11 09:18:56'),
('crs_support_note', 'Supported by the Catholic Church and CRS Ethiopia.', '2026-10-11 09:18:56'),
('default_language', 'en', '2026-10-11 09:18:56'),
('maintenance_mode', 'false', '2026-10-11 09:18:56'),
('public_email', 'info@example.edu.et', '2026-10-11 09:18:56'),
('public_phone', '+251-00-000-0000', '2026-10-11 09:18:56'),
('short_name', 'SATVC', '2026-10-11 09:18:56'),
('timezone', 'Africa/Addis_Ababa', '2026-10-11 09:18:56');

-- --------------------------------------------------------

--
-- Table structure for table `spreadsheet_templates`
--

CREATE TABLE `spreadsheet_templates` (
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `module_code` varchar(80) NOT NULL,
  `entity_name` varchar(100) NOT NULL,
  `template_name` varchar(150) NOT NULL,
  `version_number` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `column_schema` longtext NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_attendance`
--

CREATE TABLE `staff_attendance` (
  `attendance_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('present','absent','late','excused','on_leave') NOT NULL DEFAULT 'present',
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `recorded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_leave_requests`
--

CREATE TABLE `staff_leave_requests` (
  `leave_id` bigint(20) UNSIGNED NOT NULL,
  `staff_id` bigint(20) UNSIGNED NOT NULL,
  `leave_type` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff_leave_requests`
--

INSERT INTO `staff_leave_requests` (`leave_id`, `staff_id`, `leave_type`, `start_date`, `end_date`, `status`, `reason`, `submitted_at`, `reviewed_by`, `reviewed_at`) VALUES
(1, 1, 'annual', '2026-11-05', '2026-11-08', 'pending', 'Medical checks and study leave', '2026-11-05 14:32:21', NULL, NULL),
(1001, 3, 'annual', '2026-11-20', '2026-11-22', 'pending', 'Personal leave request for three days.', '2026-11-06 05:00:00', NULL, NULL),
(1002, 4, 'training', '2026-12-01', '2026-12-03', 'approved', 'Participation in a professional development course.', '2026-11-02 05:00:00', 1, '2026-11-04 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `staff_leave_types`
--

CREATE TABLE `staff_leave_types` (
  `leave_type_id` bigint(20) UNSIGNED NOT NULL,
  `type_name` varchar(60) NOT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 1,
  `default_days` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `student_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `program` varchar(150) DEFAULT NULL,
  `enrollment_year` smallint(5) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `program_id` bigint(20) UNSIGNED DEFAULT NULL,
  `class_group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('female','male','other','undisclosed') DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('active','graduated','suspended','withdrawn') NOT NULL DEFAULT 'active',
  `photo_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `student_number`, `first_name`, `middle_name`, `last_name`, `program`, `enrollment_year`, `created_at`, `program_id`, `class_group_id`, `date_of_birth`, `gender`, `phone`, `email`, `address`, `status`) VALUES
(2, 5, 'ST-DEMO-002', 'Martha', NULL, 'Bekele', 'Information Technology', 2024, '2026-10-11 07:11:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active'),
(3, 6, 'ST-DEMO-003', 'Dawit', NULL, 'Tesfaye', 'Automotive Technology', 2023, '2026-10-11 07:11:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active'),
(4, 20, 'ST-DEMO-004', 'Sara', NULL, 'Alemu', 'Construction Technology', 2023, '2026-10-01 06:00:00', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'active'),
(8, 24, 'ST-DEMO-008', 'Ruth', NULL, 'Solomon', 'Accounting', 2024, '2026-10-01 06:00:00', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'active'),
(9, 25, 'ST-DEMO-009', 'Bereket', NULL, 'Kebede', 'General Mechanics', 2025, '2026-10-01 06:00:00', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'active'),
(10, 26, 'ST-DEMO-010', 'Meron', NULL, 'Worku', 'Hospitality Operations', 2023, '2026-10-01 06:00:00', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'active'),
(11, 17, 'SA-2026-0001', 'Abel', NULL, 'Mekonnen', 'Electrical Installation', 2026, '2026-10-11 09:14:18', 1, NULL, NULL, 'male', '+251922000001', 'student01@example.edu', NULL, 'active'),
(12, 1001, 'SA-2026-0002', 'Hana', NULL, 'Tadesse', 'Electrical Installation', 2026, '2026-11-06 05:00:00', 1, NULL, '2006-02-02', 'female', '+2519222000001', 'student11@demo.satvc.edu.et', 'Lemo, Ethiopia', 'active'),
(13, 1002, 'SA-2026-0003', 'Mekdes', NULL, 'Alemu', 'Information Technology', 2026, '2026-11-06 05:00:00', 2, NULL, '2007-03-03', 'female', '+2519322000002', 'student12@demo.satvc.edu.et', 'Ankober, Ethiopia', 'active'),
(14, 1003, 'SA-2026-0004', 'Yohannes', NULL, 'Girma', 'Automotive Technology', 2026, '2026-11-06 05:00:00', 3, NULL, '2005-04-04', 'male', '+2519422000003', 'student13@demo.satvc.edu.et', 'Gimbichu, Ethiopia', 'active'),
(15, 1004, 'SA-2026-0005', 'Selamawit', NULL, 'Kebede', 'Construction Technology', 2026, '2026-11-06 05:00:00', 4, NULL, '2006-05-05', 'female', '+2519522000004', 'student14@demo.satvc.edu.et', 'Shone, Ethiopia', 'active'),
(16, 1005, 'SA-2026-0006', 'Natnael', NULL, 'Worku', 'Welding Technology', 2026, '2026-11-06 05:00:00', 5, NULL, '2007-06-06', 'male', '+2519622000005', 'student15@demo.satvc.edu.et', 'Hossana, Ethiopia', 'active'),
(17, 1006, 'SA-2026-0007', 'Bethlehem', NULL, 'Solomon', 'Plumbing', 2026, '2026-11-06 05:00:00', 6, NULL, '2005-07-07', 'female', '+2519722000006', 'student16@demo.satvc.edu.et', 'Lemo, Ethiopia', 'active'),
(18, 1007, 'SA-2026-0008', 'Fitsum', NULL, 'Mekonnen', 'Refrigeration and Air Conditioning', 2026, '2026-11-06 05:00:00', 7, NULL, '2006-08-08', 'male', '+2519822000007', 'student17@demo.satvc.edu.et', 'Ankober, Ethiopia', 'active'),
(19, 1008, 'SA-2026-0009', 'Rahel', NULL, 'Tesfaye', 'Accounting', 2026, '2026-11-06 05:00:00', 8, NULL, '2007-09-09', 'female', '+2519122000008', 'student18@demo.satvc.edu.et', 'Gimbichu, Ethiopia', 'active'),
(20, 1009, 'SA-2026-0010', 'Henok', NULL, 'Bekele', 'General Mechanics', 2026, '2026-11-06 05:00:00', 9, NULL, '2005-10-10', 'male', '+2519222000009', 'student19@demo.satvc.edu.et', 'Shone, Ethiopia', 'active'),
(21, 1010, 'SA-2026-0011', 'Eden', NULL, 'Haile', 'Hospitality Operations', 2026, '2026-11-06 05:00:00', 10, NULL, '2006-11-11', 'female', '+2519322000010', 'student20@demo.satvc.edu.et', 'Hossana, Ethiopia', 'active'),
(22, 1011, 'SA-2026-0012', 'Samuel', NULL, 'Abebe', 'Electrical Installation', 2026, '2026-11-06 05:00:00', 1, NULL, '2007-12-12', 'male', '+2519422000011', 'student21@demo.satvc.edu.et', 'Lemo, Ethiopia', 'active'),
(23, 1012, 'SA-2026-0013', 'Mimi', NULL, 'Getachew', 'Information Technology', 2026, '2026-11-06 05:00:00', 2, NULL, '2005-01-13', 'female', '+2519522000012', 'student22@demo.satvc.edu.et', 'Ankober, Ethiopia', 'active'),
(24, 1013, 'SA-2026-0014', 'Kalkidan', NULL, 'Demissie', 'Automotive Technology', 2026, '2026-11-06 05:00:00', 3, NULL, '2006-02-14', 'female', '+2519622000013', 'student23@demo.satvc.edu.et', 'Gimbichu, Ethiopia', 'active'),
(25, 1014, 'SA-2026-0015', 'Biruk', NULL, 'Assefa', 'Construction Technology', 2026, '2026-11-06 05:00:00', 4, NULL, '2007-03-15', 'male', '+2519722000014', 'student24@demo.satvc.edu.et', 'Shone, Ethiopia', 'active'),
(26, 1015, 'SA-2026-0016', 'Tigist', NULL, 'Wolde', 'Welding Technology', 2026, '2026-11-06 05:00:00', 5, NULL, '2005-04-16', 'female', '+2519822000015', 'student25@demo.satvc.edu.et', 'Hossana, Ethiopia', 'active'),
(27, 1016, 'SA-2026-0017', 'Dawit', NULL, 'Lemma', 'Plumbing', 2026, '2026-11-06 05:00:00', 6, NULL, '2006-05-17', 'male', '+2519122000016', 'student26@demo.satvc.edu.et', 'Lemo, Ethiopia', 'active'),
(28, 1017, 'SA-2026-0018', 'Lydia', NULL, 'Kassa', 'Refrigeration and Air Conditioning', 2026, '2026-11-06 05:00:00', 7, NULL, '2007-06-18', 'female', '+2519222000017', 'student27@demo.satvc.edu.et', 'Ankober, Ethiopia', 'active'),
(29, 1018, 'SA-2026-0019', 'Robel', NULL, 'Desta', 'Accounting', 2026, '2026-11-06 05:00:00', 8, NULL, '2005-07-19', 'male', '+2519322000018', 'student28@demo.satvc.edu.et', 'Gimbichu, Ethiopia', 'active'),
(30, 1019, 'SA-2026-0020', 'Martha', NULL, 'Negash', 'General Mechanics', 2026, '2026-11-06 05:00:00', 9, NULL, '2006-08-20', 'female', '+2519422000019', 'student29@demo.satvc.edu.et', 'Shone, Ethiopia', 'active'),
(31, 1020, 'SA-2026-0021', 'Abel', NULL, 'Fikadu', 'Hospitality Operations', 2026, '2026-11-06 05:00:00', 10, NULL, '2007-09-21', 'male', '+2519522000020', 'student30@demo.satvc.edu.et', 'Hossana, Ethiopia', 'active'),
(32, 1021, 'SA-2026-0022', 'Saron', NULL, 'Mulugeta', 'Electrical Installation', 2026, '2026-11-06 05:00:00', 1, NULL, '2005-10-22', 'female', '+2519622000021', 'student31@demo.satvc.edu.et', 'Lemo, Ethiopia', 'active'),
(33, 1022, 'SA-2026-0023', 'Nardos', NULL, 'Amanuel', 'Information Technology', 2026, '2026-11-06 05:00:00', 2, NULL, '2006-11-23', 'female', '+2519722000022', 'student32@demo.satvc.edu.et', 'Ankober, Ethiopia', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `student_academic_enrollments`
--

CREATE TABLE `student_academic_enrollments` (
  `academic_enrollment_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `program_id` bigint(20) UNSIGNED NOT NULL,
  `academic_year_id` bigint(20) UNSIGNED NOT NULL,
  `class_group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `level_number` tinyint(3) UNSIGNED NOT NULL,
  `enrollment_status` enum('active','completed','transferred','withdrawn','suspended') NOT NULL DEFAULT 'active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `recorded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_academic_enrollments`
--

INSERT INTO `student_academic_enrollments` (`academic_enrollment_id`, `student_id`, `program_id`, `academic_year_id`, `class_group_id`, `level_number`, `enrollment_status`, `start_date`, `end_date`, `recorded_by`, `notes`, `created_at`) VALUES
(1, 9, 9, 2, NULL, 1, 'active', '2025-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(2, 11, 1, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(3, 12, 1, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(4, 13, 2, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(5, 14, 3, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(6, 15, 4, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(7, 16, 5, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(8, 17, 6, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(9, 18, 7, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(10, 19, 8, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(11, 20, 9, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(12, 21, 10, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(13, 22, 1, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(14, 23, 2, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(15, 24, 3, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(16, 25, 4, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(17, 26, 5, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(18, 27, 6, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(19, 28, 7, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(20, 29, 8, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(21, 30, 9, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(22, 31, 10, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(23, 32, 1, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19'),
(24, 33, 2, 1, NULL, 1, 'active', '2026-01-01', NULL, NULL, NULL, '2026-11-09 08:33:19');

-- --------------------------------------------------------

--
-- Table structure for table `student_documents`
--

CREATE TABLE `student_documents` (
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `document_type` enum('id_card','enrollment_letter','transcript','certificate','other') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `generated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `generated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_documents`
--

INSERT INTO `student_documents` (`document_id`, `student_id`, `document_type`, `file_name`, `file_url`, `generated_by`, `generated_at`) VALUES
(1001, 12, 'id_card', 'SA-2026-0002-id-card.pdf', '/demo/documents/SA-2026-0002-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1002, 13, 'id_card', 'SA-2026-0003-id-card.pdf', '/demo/documents/SA-2026-0003-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1003, 14, 'id_card', 'SA-2026-0004-id-card.pdf', '/demo/documents/SA-2026-0004-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1004, 15, 'id_card', 'SA-2026-0005-id-card.pdf', '/demo/documents/SA-2026-0005-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1005, 16, 'id_card', 'SA-2026-0006-id-card.pdf', '/demo/documents/SA-2026-0006-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1006, 17, 'id_card', 'SA-2026-0007-id-card.pdf', '/demo/documents/SA-2026-0007-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1007, 18, 'id_card', 'SA-2026-0008-id-card.pdf', '/demo/documents/SA-2026-0008-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1008, 19, 'id_card', 'SA-2026-0009-id-card.pdf', '/demo/documents/SA-2026-0009-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1009, 20, 'id_card', 'SA-2026-0010-id-card.pdf', '/demo/documents/SA-2026-0010-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1010, 21, 'id_card', 'SA-2026-0011-id-card.pdf', '/demo/documents/SA-2026-0011-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1011, 22, 'id_card', 'SA-2026-0012-id-card.pdf', '/demo/documents/SA-2026-0012-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1012, 23, 'id_card', 'SA-2026-0013-id-card.pdf', '/demo/documents/SA-2026-0013-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1013, 24, 'id_card', 'SA-2026-0014-id-card.pdf', '/demo/documents/SA-2026-0014-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1014, 25, 'id_card', 'SA-2026-0015-id-card.pdf', '/demo/documents/SA-2026-0015-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1015, 26, 'id_card', 'SA-2026-0016-id-card.pdf', '/demo/documents/SA-2026-0016-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1016, 27, 'id_card', 'SA-2026-0017-id-card.pdf', '/demo/documents/SA-2026-0017-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1017, 28, 'id_card', 'SA-2026-0018-id-card.pdf', '/demo/documents/SA-2026-0018-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1018, 29, 'id_card', 'SA-2026-0019-id-card.pdf', '/demo/documents/SA-2026-0019-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1019, 30, 'id_card', 'SA-2026-0020-id-card.pdf', '/demo/documents/SA-2026-0020-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1020, 31, 'id_card', 'SA-2026-0021-id-card.pdf', '/demo/documents/SA-2026-0021-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1021, 32, 'id_card', 'SA-2026-0022-id-card.pdf', '/demo/documents/SA-2026-0022-id-card.pdf', 1, '2026-11-06 09:15:00'),
(1022, 33, 'id_card', 'SA-2026-0023-id-card.pdf', '/demo/documents/SA-2026-0023-id-card.pdf', 1, '2026-11-06 09:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `student_import_batches`
--

CREATE TABLE `student_import_batches` (
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `imported_by` bigint(20) UNSIGNED NOT NULL,
  `source_file` varchar(255) DEFAULT NULL,
  `total_rows` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `imported_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_import_batches`
--

INSERT INTO `student_import_batches` (`batch_id`, `imported_by`, `source_file`, `total_rows`, `imported_at`) VALUES
(1001, 1, 'demo_student_import_november.xlsx', 24, '2026-11-06 08:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `student_import_errors`
--

CREATE TABLE `student_import_errors` (
  `error_id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `row_number` int(10) UNSIGNED NOT NULL,
  `error_message` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_import_errors`
--

INSERT INTO `student_import_errors` (`error_id`, `batch_id`, `row_number`, `error_message`, `created_at`) VALUES
(1001, 1001, 7, 'Missing required student phone number.', '2026-11-06 05:45:00'),
(1002, 1001, 19, 'Program code does not match an active program.', '2026-11-06 05:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `student_service_requests`
--

CREATE TABLE `student_service_requests` (
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `service_type` varchar(80) NOT NULL,
  `subject` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('submitted','under_review','awaiting_student','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'submitted',
  `assigned_to` bigint(20) UNSIGNED DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `resolved_at` datetime DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `employee_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `department` varchar(150) DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `status` enum('active','inactive','on_leave') NOT NULL DEFAULT 'active',
  `photo_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `user_id`, `employee_number`, `first_name`, `last_name`, `department`, `department_id`, `created_at`, `phone`, `email`, `hire_date`, `status`) VALUES
(1, 2, 'EMP-DEMO-001', 'Daniel', 'Kebede', 'Information Technology', NULL, '2026-10-11 07:11:01', NULL, NULL, NULL, 'active'),
(2, 3, 'EMP-DEMO-002', 'Hana', 'Worku', 'Electrical Technology', NULL, '2026-10-11 07:11:01', NULL, NULL, NULL, 'active'),
(3, 7, 'EMP-2026-001', 'Daniel', 'Kebede', 'Electrical Technology', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(4, 8, 'EMP-2026-002', 'Hana', 'Worku', 'ICT', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(5, 9, 'EMP-2026-003', 'Abebe', 'Tadesse', 'Automotive', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(6, 10, 'EMP-2026-004', 'Marta', 'Bekele', 'Construction', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(7, 11, 'EMP-2026-005', 'Samuel', 'Alemu', 'Manufacturing', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(8, 12, 'EMP-2026-006', 'Selam', 'Girma', 'Building Services', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(9, 13, 'EMP-2026-007', 'Dawit', 'Tesfaye', 'Business', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(10, 14, 'EMP-2026-008', 'Rahel', 'Mekonnen', 'Hospitality', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(11, 15, 'EMP-2026-009', 'Yonas', 'Haile', 'ICT', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active'),
(12, 16, 'EMP-2026-010', 'Liya', 'Solomon', 'Electrical Technology', NULL, '2026-10-01 06:00:00', NULL, NULL, NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_offering_assignments`
--

CREATE TABLE `teacher_offering_assignments` (
  `assignment_id` bigint(20) UNSIGNED NOT NULL,
  `offering_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `assignment_role` enum('primary','assistant','substitute') NOT NULL DEFAULT 'primary',
  `assigned_from` date DEFAULT NULL,
  `assigned_until` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teacher_offering_assignments`
--

INSERT INTO `teacher_offering_assignments` (`assignment_id`, `offering_id`, `teacher_id`, `assignment_role`, `assigned_from`, `assigned_until`, `is_active`, `assigned_by`, `created_at`) VALUES
(1, 1, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(2, 2, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(3, 3, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(4, 4, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(5, 5, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(6, 6, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(7, 7, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(8, 8, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(9, 9, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(10, 10, 1, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(11, 11, 3, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(12, 16, 3, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(13, 12, 4, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(14, 17, 4, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(15, 13, 5, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(16, 18, 5, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(17, 14, 6, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(18, 19, 6, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(19, 15, 7, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37'),
(20, 20, 7, 'primary', NULL, NULL, 1, NULL, '2026-11-09 08:29:37');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_qualifications`
--

CREATE TABLE `teacher_qualifications` (
  `qualification_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `qualification` varchar(150) NOT NULL,
  `field_of_study` varchar(150) DEFAULT NULL,
  `institution` varchar(180) DEFAULT NULL,
  `year_completed` smallint(5) UNSIGNED DEFAULT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `term_configurations`
--

CREATE TABLE `term_configurations` (
  `term_config_id` bigint(20) UNSIGNED NOT NULL,
  `academic_year_id` bigint(20) UNSIGNED NOT NULL,
  `semester_id` bigint(20) UNSIGNED NOT NULL,
  `is_active_term` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_entries`
--

CREATE TABLE `timetable_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `offering_id` bigint(20) UNSIGNED NOT NULL,
  `weekday` tinyint(3) UNSIGNED NOT NULL COMMENT '1=Monday ... 7=Sunday',
  `starts_at` time NOT NULL,
  `ends_at` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `room_id` bigint(20) UNSIGNED DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_until` date DEFAULT NULL,
  `schedule_status` enum('active','cancelled','superseded') NOT NULL DEFAULT 'active'
) ;

--
-- Dumping data for table `timetable_entries`
--

INSERT INTO `timetable_entries` (`id`, `offering_id`, `weekday`, `starts_at`, `ends_at`, `room`, `room_id`, `effective_from`, `effective_until`, `schedule_status`) VALUES
(1001, 11, 1, '08:30:00', '10:30:00', 'Room 101', NULL, NULL, NULL, 'active'),
(1002, 11, 3, '10:45:00', '12:45:00', 'Workshop 01', NULL, NULL, NULL, 'active'),
(1003, 12, 2, '08:30:00', '10:30:00', 'Room 102', NULL, NULL, NULL, 'active'),
(1004, 12, 4, '10:45:00', '12:45:00', 'Workshop 02', NULL, NULL, NULL, 'active'),
(1005, 13, 3, '08:30:00', '10:30:00', 'Room 103', NULL, NULL, NULL, 'active'),
(1006, 13, 5, '10:45:00', '12:45:00', 'Workshop 03', NULL, NULL, NULL, 'active'),
(1007, 14, 4, '08:30:00', '10:30:00', 'Room 104', NULL, NULL, NULL, 'active'),
(1008, 14, 1, '10:45:00', '12:45:00', 'Workshop 04', NULL, NULL, NULL, 'active'),
(1009, 15, 5, '08:30:00', '10:30:00', 'Room 105', NULL, NULL, NULL, 'active'),
(1010, 15, 2, '10:45:00', '12:45:00', 'Workshop 05', NULL, NULL, NULL, 'active'),
(1011, 16, 1, '08:30:00', '10:30:00', 'Room 106', NULL, NULL, NULL, 'active'),
(1012, 16, 3, '10:45:00', '12:45:00', 'Workshop 06', NULL, NULL, NULL, 'active'),
(1013, 17, 2, '08:30:00', '10:30:00', 'Room 107', NULL, NULL, NULL, 'active'),
(1014, 17, 4, '10:45:00', '12:45:00', 'Workshop 07', NULL, NULL, NULL, 'active'),
(1015, 18, 3, '08:30:00', '10:30:00', 'Room 108', NULL, NULL, NULL, 'active'),
(1016, 18, 5, '10:45:00', '12:45:00', 'Workshop 08', NULL, NULL, NULL, 'active'),
(1017, 19, 4, '08:30:00', '10:30:00', 'Room 109', NULL, NULL, NULL, 'active'),
(1018, 19, 1, '10:45:00', '12:45:00', 'Workshop 09', NULL, NULL, NULL, 'active'),
(1019, 20, 5, '08:30:00', '10:30:00', 'Room 110', NULL, NULL, NULL, 'active'),
(1020, 20, 2, '10:45:00', '12:45:00', 'Workshop 10', NULL, NULL, NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `timetable_room_assignments`
--

CREATE TABLE `timetable_room_assignments` (
  `assignment_id` bigint(20) UNSIGNED NOT NULL,
  `timetable_slot_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timetable_room_assignments`
--

INSERT INTO `timetable_room_assignments` (`assignment_id`, `timetable_slot_id`, `room_id`, `assigned_by`, `assigned_at`) VALUES
(1001, 1001, 1, 1, '2026-11-06 08:30:00'),
(1002, 1002, 2, 1, '2026-11-06 08:30:00'),
(1003, 1003, 3, 1, '2026-11-06 08:30:00'),
(1004, 1004, 4, 1, '2026-11-06 08:30:00'),
(1005, 1005, 5, 1, '2026-11-06 08:30:00'),
(1006, 1006, 6, 1, '2026-11-06 08:30:00'),
(1007, 1007, 7, 1, '2026-11-06 08:30:00'),
(1008, 1008, 8, 1, '2026-11-06 08:30:00'),
(1009, 1009, 9, 1, '2026-11-06 08:30:00'),
(1010, 1010, 10, 1, '2026-11-06 08:30:00'),
(1011, 1011, 11, 1, '2026-11-06 08:30:00'),
(1012, 1012, 12, 1, '2026-11-06 08:30:00'),
(1013, 1013, 13, 1, '2026-11-06 08:30:00'),
(1014, 1014, 14, 1, '2026-11-06 08:30:00'),
(1015, 1015, 15, 1, '2026-11-06 08:30:00'),
(1016, 1016, 16, 1, '2026-11-06 08:30:00'),
(1017, 1017, 17, 1, '2026-11-06 08:30:00'),
(1018, 1018, 18, 1, '2026-11-06 08:30:00'),
(1019, 1019, 19, 1, '2026-11-06 08:30:00'),
(1020, 1020, 20, 1, '2026-11-06 08:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','teacher','student','registrar','librarian','department_head','admissions_officer','academic_coordinator') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`, `last_login_at`) VALUES
(1, 'demo_admin', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'admin', 1, '2026-10-11 07:11:01', '2026-11-15 08:38:52', '2026-11-15 11:38:52'),
(2, 'demo_teacher1', 'demo-only-not-a-valid-password-hash', 'teacher', 1, '2026-10-11 07:11:01', '2026-10-11 07:11:01', NULL),
(3, 'demo_teacher2', 'demo-only-not-a-valid-password-hash', 'teacher', 1, '2026-10-11 07:11:01', '2026-10-11 07:11:01', NULL),
(4, 'demo_student1', 'demo-only-not-a-valid-password-hash', 'student', 1, '2026-10-11 07:11:01', '2026-10-11 07:11:01', NULL),
(5, 'demo_student2', 'demo-only-not-a-valid-password-hash', 'student', 1, '2026-10-11 07:11:01', '2026-10-11 07:11:01', NULL),
(6, 'demo_student3', 'demo-only-not-a-valid-password-hash', 'student', 1, '2026-10-11 07:11:01', '2026-10-11 07:11:01', NULL),
(7, 'demo_teacher01', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-11-13 11:31:24', '2026-11-13 14:31:24'),
(8, 'demo_teacher02', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-11-13 11:30:53', '2026-11-13 14:30:53'),
(9, 'demo_teacher03', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(10, 'demo_teacher04', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(11, 'demo_teacher05', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(12, 'demo_teacher06', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(13, 'demo_teacher07', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(14, 'demo_teacher08', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(15, 'demo_teacher09', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(16, 'demo_teacher10', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'teacher', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(17, 'demo_student01', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-11-15 08:34:34', '2026-11-15 11:34:34'),
(18, 'demo_student02', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-11-13 11:36:12', '2026-11-13 14:36:12'),
(19, 'demo_student03', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-11-13 11:25:43', '2026-11-13 14:25:43'),
(20, 'demo_student04', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-11-13 11:40:42', '2026-11-13 14:40:42'),
(21, 'demo_student05', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-11-13 11:38:48', '2026-11-13 14:38:48'),
(22, 'demo_student06', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(23, 'demo_student07', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(24, 'demo_student08', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(25, 'demo_student09', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-10-16 06:28:45', NULL),
(26, 'demo_student10', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-10-01 06:00:00', '2026-11-13 11:43:59', '2026-11-13 14:43:59'),
(1001, 'demo_student11', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1002, 'demo_student12', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1003, 'demo_student13', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1004, 'demo_student14', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1005, 'demo_student15', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1006, 'demo_student16', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1007, 'demo_student17', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1008, 'demo_student18', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1009, 'demo_student19', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1010, 'demo_student20', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1011, 'demo_student21', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1012, 'demo_student22', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1013, 'demo_student23', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1014, 'demo_student24', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1015, 'demo_student25', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1016, 'demo_student26', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1017, 'demo_student27', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1018, 'demo_student28', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1019, 'demo_student29', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1020, 'demo_student30', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1021, 'demo_student31', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL),
(1022, 'demo_student32', '$2a$12$IheXkv/BUS3TytKhlwRi/eKgNrP2ZM39t265x/tnOatQEaE8z1z2.', 'student', 1, '2026-11-06 05:00:00', '2026-11-06 05:00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_role_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_role_id`, `user_id`, `role_id`, `is_default`, `is_active`, `assigned_by`, `assigned_at`) VALUES
(1, 1, 1, 1, 1, NULL, '2026-11-09 08:29:34'),
(2, 4, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(3, 5, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(4, 6, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(5, 17, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(6, 18, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(7, 19, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(8, 20, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(9, 21, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(10, 22, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(11, 23, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(12, 24, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(13, 25, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(14, 26, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(15, 1001, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(16, 1002, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(17, 1003, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(18, 1004, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(19, 1005, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(20, 1006, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(21, 1007, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(22, 1008, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(23, 1009, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(24, 1010, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(25, 1011, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(26, 1012, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(27, 1013, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(28, 1014, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(29, 1015, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(30, 1016, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(31, 1017, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(32, 1018, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(33, 1019, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(34, 1020, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(35, 1021, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(36, 1022, 3, 1, 1, NULL, '2026-11-09 08:29:34'),
(37, 2, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(38, 3, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(39, 7, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(40, 8, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(41, 9, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(42, 10, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(43, 11, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(44, 12, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(45, 13, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(46, 14, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(47, 15, 2, 1, 1, NULL, '2026-11-09 08:29:34'),
(48, 16, 2, 1, 1, NULL, '2026-11-09 08:29:34');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` char(64) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `login_at` datetime NOT NULL DEFAULT current_timestamp(),
  `logout_at` datetime DEFAULT NULL,
  `revoked_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`session_id`, `user_id`, `token_hash`, `ip_address`, `user_agent`, `login_at`, `logout_at`, `revoked_at`) VALUES
(1, 1, '593a4fe5f51a6030b03f2ab08cf560364c44123272435a670ec8ac3af905fa34', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.5737', '2026-11-05 17:35:36', NULL, NULL),
(2, 7, 'b7e1acf8d7f786c1466dcf2fc5ef1f7ea570f23c6f60a5a2b40d3e18ea82d1ca', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-05 18:09:21', NULL, NULL),
(3, 17, 'ae1b6ff32cb1ee88e91a48a12fd724ab618e67ad332adc71d6a41a5cf1bf69c3', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', '2026-11-05 18:23:35', NULL, NULL),
(4, 1, '0915039c22f89ad722c7fc0893df5eeff26a9f003a0a8c10cb432bc7f76e6527', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', '2026-11-05 18:24:35', NULL, NULL),
(5, 7, 'b27ad0b50524f3bc0f25386e65d35c1f0272a6e433991b21c1f0a504df19a0ce', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.129.1 Chrome/148.0.7778.280 Electron/42.6.0 Safari/537.36', '2026-11-06 09:40:09', NULL, NULL),
(6, 17, '2dceaec6b32a8ce47d7a69b90698a893377072a982e817c9d8b23ef3bcc7b6d9', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', '2026-11-06 09:56:14', NULL, NULL),
(7, 7, '1cbeaed7ce2e97959e2ef1ae07f3b260c3a6d4127a2801ef71361f277cd7926a', '::1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36', '2026-11-06 10:24:22', NULL, NULL),
(8, 17, '5ad01978ebe38db37044f9cc9d9481bcb51692d9680ac573e29c35cf91a704de', '::1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36', '2026-11-06 10:40:41', NULL, NULL),
(9, 17, 'cb98c90fbd510649ec99e1ff20307cfd1c10ccb93b1b56dd6236633df24cf6a2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-06 16:29:36', NULL, NULL),
(10, 1, '70691abcd2ac2b90812d797cf6df4bae920184981e19c4f7546b665e69d4dd00', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-06 16:31:42', NULL, NULL),
(11, 17, '7acdfca2f8a299a27ec572f4c8d297f84ab8a6beff824acf7c197b12b587695e', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-06 16:49:47', NULL, NULL),
(12, 17, 'fbdadde1d833b6f2964f8323c3b74cb9683be60c8ffd68ad278c926e413d4fe5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-09 14:10:17', NULL, NULL),
(13, 1, 'b0543a1865793d3153108e5d0337a43380ccb8bd07038cc0c0bbcf45981bd8b1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-09 14:45:06', NULL, NULL),
(14, 17, 'ca7edbd411e7b59a94481a24cd5314ec24a23281c98c910d752a3a47979349ef', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-11-09 14:53:25', NULL, NULL),
(15, 17, 'ac02fe9940a14bb8b71584644b0801c89756901f2f3c96227f3b6c99c0ebb18a', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-12 09:36:49', NULL, NULL),
(16, 1, 'd7a00e6c5dda4d81a9ec55660e7f11982380214102a1fe30b7a5dde64e501d17', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 13:18:28', NULL, NULL),
(17, 1, '2fd4e5e4011fc2a80289c496c3d6640728a6a401144129c8034fd3922875e215', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 13:26:20', NULL, NULL),
(18, 17, 'b2e07887a950f25fee171d312402b1535e305fe1c7ed76c19e9ce88c95d48f5e', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:03:01', NULL, NULL),
(19, 7, 'b418e9270cdc034b6c4254fccf6ca3a45b99b48b34a4003b04a8738dc6b018af', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:03:36', NULL, NULL),
(20, 17, '1fad1e2aa43bed43726ca0176afa3401fde09cc2b10da7954ce2510df0aaf087', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:22:23', NULL, NULL),
(21, 18, 'a45a90dda337a51654f96ca656ccdda9c1b4dc8996ba27d12e8965ae2657b5cf', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:24:07', NULL, NULL),
(22, 17, '0f34f41eaba752ddce8c6bd1d7d90d74b2435fe20e0224498b3408026dbda336', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:25:18', NULL, NULL),
(23, 19, 'c839e0efbcddc7f85388672875beb000207807b734f6e20c429bcf88d0008066', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:25:43', NULL, NULL),
(24, 8, '49c64a20d76597e26ef662eee5c545611994a2e00604d1e1578ac1f0bb27f4f1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:30:53', NULL, NULL),
(25, 7, 'a8e845a48c7e7d43550fcefafa3ab8a6eef0734549cb3e5e587e692dc226c4c8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:31:24', NULL, NULL),
(26, 17, 'ac01666adbd38f91122b989580de4d80507226fc23f2ae988f138723164579ad', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:34:38', NULL, NULL),
(27, 18, '1bfbef86638b8f3bd2820a6ec1d428a050516de360f9e58272ecb174f6a36819', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:36:11', NULL, NULL),
(28, 20, '2eec215d7d00fe74e0979e2651d05ca80b58d20d29d1224767a9c346c339ba70', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:37:39', NULL, NULL),
(29, 21, 'b71be3826d66076ca1903c51ca4ab0a4783e12b8a3aeb2260fba2177590789d2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:38:48', NULL, NULL),
(30, 20, 'cdff47efa291cc30e3ae16f463cfd8e9413989f5754b740dd97b3e05d063f89c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:40:42', NULL, NULL),
(31, 26, 'f3710b73aa4829cdd800215d2506dbe0a2cf71540e82219a1f6a70f49b0cced4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-13 14:43:58', NULL, NULL),
(32, 17, '9805f3067e3f379e676829d635a0dacd6460b78d5041a23dfaae0a713167d4e4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 10:25:48', NULL, NULL),
(33, 1, '830702497f5ebfcc7d4829dbdd6b0efd2b4ea2cdc35f9086577bb2ca4ed46efd', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 10:26:16', NULL, NULL),
(34, 17, 'ff09d22cf9d1591c7c7b3e4e270cd031926e5e6080969d53b26e9f988a71354a', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 10:47:19', NULL, NULL),
(35, 17, '867a94e6dc8b6b517d8ecc63c7e22a9e65ceb80cacc724c0176f274fd0661279', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 13:21:28', NULL, NULL),
(36, 17, '40b192069246bf8cb91ef9f31685d2e6c46ce122b2f855cb517a90fd1f5db44f', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 16:56:35', NULL, NULL),
(37, 17, 'f76039efb4ce18a1791cf9c500d98fcfa52d8807c6629e6414471f55fd32bf63', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-14 17:19:35', NULL, NULL),
(38, 17, '3dce0fea6d1b34cb7ee809a6b38e15e06f3488d74ac69656d13f4de2085058ca', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-15 11:34:34', NULL, NULL),
(39, 1, '5d0b1660dee38368a372feae91d31f6ef1a9b50f54e9ad1c15b0a38612af8c8c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-15 11:38:52', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_calendar_events`
--
ALTER TABLE `academic_calendar_events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_academic_calendar_dates` (`starts_at`,`ends_at`),
  ADD KEY `fk_academic_calendar_creator` (`created_by`);

--
-- Indexes for table `academic_settings`
--
ALTER TABLE `academic_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `uq_academic_settings_key` (`setting_key`),
  ADD KEY `fk_academic_setting_user` (`updated_by`);

--
-- Indexes for table `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `admissions`
--
ALTER TABLE `admissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_number` (`application_number`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_announcement_status` (`status`,`published_at`),
  ADD KEY `fk_announcements_department` (`department_id`),
  ADD KEY `idx_announcements_class_group` (`class_group_id`);

--
-- Indexes for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD PRIMARY KEY (`announcement_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `offering_id` (`offering_id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `offering_id` (`offering_id`);

--
-- Indexes for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_submission` (`assessment_id`,`student_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `idx_submissions_assignment` (`assignment_id`),
  ADD KEY `idx_submissions_reviewer` (`reviewed_by`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_session_student` (`session_id`,`student_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_attendance_session` (`offering_id`,`session_date`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `idx_audit_logs_actor` (`actor_user_id`),
  ADD KEY `idx_audit_logs_user` (`user_id`),
  ADD KEY `idx_audit_logs_action` (`action`),
  ADD KEY `idx_audit_logs_created` (`created_at`);

--
-- Indexes for table `audit_log_changes`
--
ALTER TABLE `audit_log_changes`
  ADD PRIMARY KEY (`change_id`),
  ADD KEY `idx_audit_changes_audit` (`audit_id`);

--
-- Indexes for table `classroom_resources`
--
ALTER TABLE `classroom_resources`
  ADD PRIMARY KEY (`resource_id`),
  ADD KEY `idx_classroom_resources_classroom` (`classroom_id`),
  ADD KEY `idx_classroom_resources_status` (`status`);

--
-- Indexes for table `class_groups`
--
ALTER TABLE `class_groups`
  ADD PRIMARY KEY (`class_group_id`),
  ADD UNIQUE KEY `uq_class_group` (`program_id`,`academic_year_id`,`level_number`,`section_code`),
  ADD KEY `idx_class_groups_year` (`academic_year_id`),
  ADD KEY `idx_class_groups_program` (`program_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `handled_by` (`handled_by`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `course_offerings`
--
ALTER TABLE `course_offerings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_offering` (`course_id`,`teacher_id`,`semester_id`,`section`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `semester_id` (`semester_id`),
  ADD KEY `idx_course_offerings_room` (`room_id`);

--
-- Indexes for table `data_export_logs`
--
ALTER TABLE `data_export_logs`
  ADD PRIMARY KEY (`export_id`),
  ADD KEY `idx_export_module_date` (`module_code`,`exported_at`),
  ADD KEY `idx_export_user` (`exported_by`);

--
-- Indexes for table `data_import_batches`
--
ALTER TABLE `data_import_batches`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `idx_import_module_status` (`module_code`,`status`),
  ADD KEY `idx_import_user` (`imported_by`);

--
-- Indexes for table `data_import_errors`
--
ALTER TABLE `data_import_errors`
  ADD PRIMARY KEY (`error_id`),
  ADD KEY `idx_import_errors_batch` (`batch_id`),
  ADD KEY `idx_import_errors_row` (`import_row_id`);

--
-- Indexes for table `data_import_rows`
--
ALTER TABLE `data_import_rows`
  ADD PRIMARY KEY (`import_row_id`),
  ADD UNIQUE KEY `uq_import_batch_row` (`batch_id`,`row_number`),
  ADD KEY `idx_import_rows_status` (`batch_id`,`row_status`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `uq_departments_code` (`code`),
  ADD UNIQUE KEY `uq_departments_name` (`name`),
  ADD KEY `idx_departments_head_staff` (`head_staff_id`);

--
-- Indexes for table `department_name_mapping_review`
--
ALTER TABLE `department_name_mapping_review`
  ADD PRIMARY KEY (`source_table`,`source_value`),
  ADD KEY `idx_department_mapping_status` (`review_status`);

--
-- Indexes for table `document_templates`
--
ALTER TABLE `document_templates`
  ADD PRIMARY KEY (`template_id`),
  ADD UNIQUE KEY `uq_document_templates_name` (`template_name`),
  ADD KEY `idx_document_templates_type` (`template_type`),
  ADD KEY `fk_document_templates_user` (`updated_by`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_offering` (`student_id`,`offering_id`),
  ADD KEY `offering_id` (`offering_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `exam_schedules`
--
ALTER TABLE `exam_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `idx_exam_date` (`exam_date`),
  ADD KEY `idx_exam_room` (`room_id`),
  ADD KEY `assessment_id` (`assessment_id`),
  ADD KEY `invigilator_teacher_id` (`invigilator_teacher_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_assessment_student` (`assessment_id`,`student_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `graded_by` (`graded_by`),
  ADD KEY `idx_grades_workflow_status` (`workflow_status`),
  ADD KEY `idx_grades_submitted_by` (`submitted_by`),
  ADD KEY `idx_grades_reviewed_by` (`reviewed_by`);

--
-- Indexes for table `grade_correction_history`
--
ALTER TABLE `grade_correction_history`
  ADD PRIMARY KEY (`correction_id`),
  ADD KEY `idx_grade_correction_grade` (`grade_id`),
  ADD KEY `idx_grade_correction_actor` (`corrected_by`),
  ADD KEY `fk_grade_correction_approver` (`approved_by`);

--
-- Indexes for table `grade_lock_history`
--
ALTER TABLE `grade_lock_history`
  ADD PRIMARY KEY (`lock_id`),
  ADD KEY `idx_grade_lock_history_grade` (`grade_id`),
  ADD KEY `idx_grade_lock_history_locked_by` (`locked_by`);

--
-- Indexes for table `grade_publish_events`
--
ALTER TABLE `grade_publish_events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_grade_publish_course` (`course_id`),
  ADD KEY `idx_grade_publish_teacher` (`teacher_id`),
  ADD KEY `idx_grade_publish_semester` (`semester_id`);

--
-- Indexes for table `grading_scales`
--
ALTER TABLE `grading_scales`
  ADD PRIMARY KEY (`scale_id`);

--
-- Indexes for table `grading_scale_rules`
--
ALTER TABLE `grading_scale_rules`
  ADD PRIMARY KEY (`rule_id`),
  ADD UNIQUE KEY `uq_scale_letter` (`scale_id`,`letter_grade`);

--
-- Indexes for table `library_items`
--
ALTER TABLE `library_items`
  ADD PRIMARY KEY (`item_id`),
  ADD UNIQUE KEY `uq_library_accession` (`accession_number`),
  ADD KEY `idx_library_isbn` (`isbn`),
  ADD KEY `idx_library_title` (`title`),
  ADD KEY `idx_library_category` (`category`);

--
-- Indexes for table `library_loans`
--
ALTER TABLE `library_loans`
  ADD PRIMARY KEY (`loan_id`),
  ADD KEY `idx_library_loans_borrower` (`borrower_user_id`,`status`),
  ADD KEY `idx_library_loans_due` (`due_at`,`status`),
  ADD KEY `fk_library_loan_item` (`item_id`),
  ADD KEY `fk_library_loan_issuer` (`issued_by`),
  ADD KEY `fk_library_loan_receiver` (`received_by`);

--
-- Indexes for table `news_articles`
--
ALTER TABLE `news_articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `author_id` (`author_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notification_user_read` (`user_id`,`read_at`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `uq_permissions_code` (`permission_code`),
  ADD UNIQUE KEY `uq_permissions_resource_action` (`resource`,`action`),
  ADD KEY `idx_permissions_resource` (`resource`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_programs_department_id` (`department_id`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `result_approval_batches`
--
ALTER TABLE `result_approval_batches`
  ADD PRIMARY KEY (`approval_batch_id`),
  ADD KEY `idx_result_batches_offering` (`offering_id`),
  ADD KEY `idx_result_batches_status` (`status`),
  ADD KEY `fk_result_batch_submitter` (`submitted_by`),
  ADD KEY `fk_result_batch_reviewer` (`reviewed_by`);

--
-- Indexes for table `result_approval_items`
--
ALTER TABLE `result_approval_items`
  ADD PRIMARY KEY (`approval_item_id`),
  ADD UNIQUE KEY `uq_approval_batch_grade` (`approval_batch_id`,`grade_id`),
  ADD KEY `idx_approval_items_grade` (`grade_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `uq_roles_code` (`role_code`),
  ADD UNIQUE KEY `uq_roles_name` (`role_name`),
  ADD KEY `idx_roles_active` (`is_active`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `uq_role_permissions` (`role_name`,`resource`,`action`),
  ADD KEY `idx_role_permissions_role` (`role_name`);

--
-- Indexes for table `role_permission_map`
--
ALTER TABLE `role_permission_map`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `idx_rpm_permission` (`permission_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD UNIQUE KEY `uq_rooms_code` (`room_code`),
  ADD KEY `idx_rooms_type_status` (`room_type`,`status`);

--
-- Indexes for table `room_booking_exceptions`
--
ALTER TABLE `room_booking_exceptions`
  ADD PRIMARY KEY (`exception_id`),
  ADD KEY `idx_room_exception_date` (`room_id`,`booking_date`),
  ADD KEY `fk_room_exception_creator` (`created_by`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`name`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_semester_year_name` (`academic_year_id`,`name`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `spreadsheet_templates`
--
ALTER TABLE `spreadsheet_templates`
  ADD PRIMARY KEY (`template_id`),
  ADD UNIQUE KEY `uq_spreadsheet_template_version` (`module_code`,`entity_name`,`template_name`,`version_number`),
  ADD KEY `idx_spreadsheet_template_active` (`module_code`,`is_active`),
  ADD KEY `fk_spreadsheet_template_creator` (`created_by`);

--
-- Indexes for table `staff_attendance`
--
ALTER TABLE `staff_attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `uq_staff_attendance` (`teacher_id`,`attendance_date`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `staff_leave_requests`
--
ALTER TABLE `staff_leave_requests`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `idx_leave_staff` (`staff_id`),
  ADD KEY `idx_leave_status` (`status`),
  ADD KEY `fk_staff_leave_reviewer` (`reviewed_by`);

--
-- Indexes for table `staff_leave_types`
--
ALTER TABLE `staff_leave_types`
  ADD PRIMARY KEY (`leave_type_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_students_user` (`user_id`),
  ADD UNIQUE KEY `uq_students_number` (`student_number`),
  ADD KEY `fk_students_program` (`program_id`),
  ADD KEY `idx_students_class_group` (`class_group_id`),
  ADD KEY `idx_students_search` (`first_name`,`last_name`,`student_number`);

--
-- Indexes for table `student_academic_enrollments`
--
ALTER TABLE `student_academic_enrollments`
  ADD PRIMARY KEY (`academic_enrollment_id`),
  ADD UNIQUE KEY `uq_student_year_program_level` (`student_id`,`academic_year_id`,`program_id`,`level_number`),
  ADD KEY `idx_student_academic_enrollments_program` (`program_id`),
  ADD KEY `idx_student_academic_enrollments_group` (`class_group_id`),
  ADD KEY `idx_student_academic_enrollments_year` (`academic_year_id`),
  ADD KEY `fk_sae_recorder` (`recorded_by`);

--
-- Indexes for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `idx_student_documents_student` (`student_id`),
  ADD KEY `idx_student_documents_type` (`document_type`),
  ADD KEY `fk_student_documents_user` (`generated_by`);

--
-- Indexes for table `student_import_batches`
--
ALTER TABLE `student_import_batches`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `idx_student_import_batches_user` (`imported_by`);

--
-- Indexes for table `student_import_errors`
--
ALTER TABLE `student_import_errors`
  ADD PRIMARY KEY (`error_id`),
  ADD KEY `idx_student_import_errors_batch` (`batch_id`);

--
-- Indexes for table `student_service_requests`
--
ALTER TABLE `student_service_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_service_requests_student` (`student_id`,`submitted_at`),
  ADD KEY `idx_service_requests_status` (`status`),
  ADD KEY `idx_service_requests_assignee` (`assigned_to`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_teachers_user` (`user_id`),
  ADD UNIQUE KEY `uq_teachers_number` (`employee_number`),
  ADD KEY `idx_teachers_department_id` (`department_id`);

--
-- Indexes for table `teacher_offering_assignments`
--
ALTER TABLE `teacher_offering_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `uq_teacher_offering_role` (`offering_id`,`teacher_id`,`assignment_role`),
  ADD KEY `idx_toa_teacher_active` (`teacher_id`,`is_active`),
  ADD KEY `fk_toa_assigner` (`assigned_by`);

--
-- Indexes for table `teacher_qualifications`
--
ALTER TABLE `teacher_qualifications`
  ADD PRIMARY KEY (`qualification_id`),
  ADD KEY `idx_teacher_qualifications` (`teacher_id`);

--
-- Indexes for table `term_configurations`
--
ALTER TABLE `term_configurations`
  ADD PRIMARY KEY (`term_config_id`),
  ADD KEY `fk_term_year` (`academic_year_id`),
  ADD KEY `fk_term_semester` (`semester_id`);

--
-- Indexes for table `timetable_entries`
--
ALTER TABLE `timetable_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `offering_id` (`offering_id`),
  ADD KEY `idx_timetable_entries_room` (`room_id`);

--
-- Indexes for table `timetable_room_assignments`
--
ALTER TABLE `timetable_room_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `uq_timetable_room_assignments` (`timetable_slot_id`,`room_id`),
  ADD KEY `idx_timetable_room_assignments_slot` (`timetable_slot_id`),
  ADD KEY `fk_timetable_room_assignee` (`assigned_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_username` (`username`),
  ADD KEY `idx_users_role_active` (`role`,`is_active`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_role_id`),
  ADD UNIQUE KEY `uq_user_role` (`user_id`,`role_id`),
  ADD KEY `idx_user_roles_role_active` (`role_id`,`is_active`),
  ADD KEY `idx_user_roles_user_active` (`user_id`,`is_active`),
  ADD KEY `fk_user_roles_assigner` (`assigned_by`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_user_sessions_user` (`user_id`),
  ADD KEY `idx_user_sessions_login` (`login_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_calendar_events`
--
ALTER TABLE `academic_calendar_events`
  MODIFY `event_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1006;

--
-- AUTO_INCREMENT for table `academic_settings`
--
ALTER TABLE `academic_settings`
  MODIFY `setting_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admissions`
--
ALTER TABLE `admissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1007;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1006;

--
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1011;

--
-- AUTO_INCREMENT for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1023;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1044;

--
-- AUTO_INCREMENT for table `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1021;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `audit_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1042;

--
-- AUTO_INCREMENT for table `audit_log_changes`
--
ALTER TABLE `audit_log_changes`
  MODIFY `change_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classroom_resources`
--
ALTER TABLE `classroom_resources`
  MODIFY `resource_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1009;

--
-- AUTO_INCREMENT for table `class_groups`
--
ALTER TABLE `class_groups`
  MODIFY `class_group_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1005;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `course_offerings`
--
ALTER TABLE `course_offerings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `data_export_logs`
--
ALTER TABLE `data_export_logs`
  MODIFY `export_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `data_import_batches`
--
ALTER TABLE `data_import_batches`
  MODIFY `batch_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `data_import_errors`
--
ALTER TABLE `data_import_errors`
  MODIFY `error_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `data_import_rows`
--
ALTER TABLE `data_import_rows`
  MODIFY `import_row_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT for table `document_templates`
--
ALTER TABLE `document_templates`
  MODIFY `template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1003;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1023;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1004;

--
-- AUTO_INCREMENT for table `exam_schedules`
--
ALTER TABLE `exam_schedules`
  MODIFY `schedule_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grade_correction_history`
--
ALTER TABLE `grade_correction_history`
  MODIFY `correction_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grade_lock_history`
--
ALTER TABLE `grade_lock_history`
  MODIFY `lock_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1003;

--
-- AUTO_INCREMENT for table `grade_publish_events`
--
ALTER TABLE `grade_publish_events`
  MODIFY `event_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1011;

--
-- AUTO_INCREMENT for table `grading_scales`
--
ALTER TABLE `grading_scales`
  MODIFY `scale_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grading_scale_rules`
--
ALTER TABLE `grading_scale_rules`
  MODIFY `rule_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `library_items`
--
ALTER TABLE `library_items`
  MODIFY `item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `library_loans`
--
ALTER TABLE `library_loans`
  MODIFY `loan_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `news_articles`
--
ALTER TABLE `news_articles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1004;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1103;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1006;

--
-- AUTO_INCREMENT for table `result_approval_batches`
--
ALTER TABLE `result_approval_batches`
  MODIFY `approval_batch_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_approval_items`
--
ALTER TABLE `result_approval_items`
  MODIFY `approval_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `permission_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1180;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_booking_exceptions`
--
ALTER TABLE `room_booking_exceptions`
  MODIFY `exception_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spreadsheet_templates`
--
ALTER TABLE `spreadsheet_templates`
  MODIFY `template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_attendance`
--
ALTER TABLE `staff_attendance`
  MODIFY `attendance_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_leave_requests`
--
ALTER TABLE `staff_leave_requests`
  MODIFY `leave_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1003;

--
-- AUTO_INCREMENT for table `staff_leave_types`
--
ALTER TABLE `staff_leave_types`
  MODIFY `leave_type_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `student_academic_enrollments`
--
ALTER TABLE `student_academic_enrollments`
  MODIFY `academic_enrollment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `student_documents`
--
ALTER TABLE `student_documents`
  MODIFY `document_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1023;

--
-- AUTO_INCREMENT for table `student_import_batches`
--
ALTER TABLE `student_import_batches`
  MODIFY `batch_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1002;

--
-- AUTO_INCREMENT for table `student_import_errors`
--
ALTER TABLE `student_import_errors`
  MODIFY `error_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1003;

--
-- AUTO_INCREMENT for table `student_service_requests`
--
ALTER TABLE `student_service_requests`
  MODIFY `request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `teacher_offering_assignments`
--
ALTER TABLE `teacher_offering_assignments`
  MODIFY `assignment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `teacher_qualifications`
--
ALTER TABLE `teacher_qualifications`
  MODIFY `qualification_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `term_configurations`
--
ALTER TABLE `term_configurations`
  MODIFY `term_config_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_entries`
--
ALTER TABLE `timetable_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_room_assignments`
--
ALTER TABLE `timetable_room_assignments`
  MODIFY `assignment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1021;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1023;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `user_role_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `session_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academic_calendar_events`
--
ALTER TABLE `academic_calendar_events`
  ADD CONSTRAINT `fk_academic_calendar_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `academic_settings`
--
ALTER TABLE `academic_settings`
  ADD CONSTRAINT `fk_academic_setting_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `admissions`
--
ALTER TABLE `admissions`
  ADD CONSTRAINT `admissions_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`),
  ADD CONSTRAINT `admissions_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_announcements_class_group` FOREIGN KEY (`class_group_id`) REFERENCES `class_groups` (`class_group_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_announcements_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL;

--
-- Constraints for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD CONSTRAINT `announcement_reads_ibfk_1` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_reads_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD CONSTRAINT `attendance_sessions_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_sessions_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `audit_log_changes`
--
ALTER TABLE `audit_log_changes`
  ADD CONSTRAINT `fk_audit_change_log` FOREIGN KEY (`audit_id`) REFERENCES `audit_logs` (`audit_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `class_groups`
--
ALTER TABLE `class_groups`
  ADD CONSTRAINT `fk_class_groups_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_class_groups_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_ibfk_1` FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `course_offerings`
--
ALTER TABLE `course_offerings`
  ADD CONSTRAINT `course_offerings_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `course_offerings_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  ADD CONSTRAINT `course_offerings_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`);

--
-- Constraints for table `data_export_logs`
--
ALTER TABLE `data_export_logs`
  ADD CONSTRAINT `fk_export_user` FOREIGN KEY (`exported_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `data_import_batches`
--
ALTER TABLE `data_import_batches`
  ADD CONSTRAINT `fk_import_batch_user` FOREIGN KEY (`imported_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `data_import_errors`
--
ALTER TABLE `data_import_errors`
  ADD CONSTRAINT `fk_import_error_batch` FOREIGN KEY (`batch_id`) REFERENCES `data_import_batches` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_import_error_row` FOREIGN KEY (`import_row_id`) REFERENCES `data_import_rows` (`import_row_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `data_import_rows`
--
ALTER TABLE `data_import_rows`
  ADD CONSTRAINT `fk_import_row_batch` FOREIGN KEY (`batch_id`) REFERENCES `data_import_batches` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_departments_head_staff` FOREIGN KEY (`head_staff_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `document_templates`
--
ALTER TABLE `document_templates`
  ADD CONSTRAINT `fk_document_templates_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exam_schedules`
--
ALTER TABLE `exam_schedules`
  ADD CONSTRAINT `exam_schedules_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`),
  ADD CONSTRAINT `exam_schedules_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  ADD CONSTRAINT `exam_schedules_ibfk_3` FOREIGN KEY (`invigilator_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `exam_schedules_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `grade_correction_history`
--
ALTER TABLE `grade_correction_history`
  ADD CONSTRAINT `fk_grade_correction_actor` FOREIGN KEY (`corrected_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_grade_correction_approver` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_grade_correction_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `grade_lock_history`
--
ALTER TABLE `grade_lock_history`
  ADD CONSTRAINT `fk_grade_lock_history_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_grade_lock_history_user` FOREIGN KEY (`locked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grade_publish_events`
--
ALTER TABLE `grade_publish_events`
  ADD CONSTRAINT `fk_grade_publish_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_grade_publish_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_grade_publish_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grading_scale_rules`
--
ALTER TABLE `grading_scale_rules`
  ADD CONSTRAINT `grading_scale_rules_ibfk_1` FOREIGN KEY (`scale_id`) REFERENCES `grading_scales` (`scale_id`);

--
-- Constraints for table `library_loans`
--
ALTER TABLE `library_loans`
  ADD CONSTRAINT `fk_library_loan_borrower` FOREIGN KEY (`borrower_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_library_loan_issuer` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_library_loan_item` FOREIGN KEY (`item_id`) REFERENCES `library_items` (`item_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_library_loan_receiver` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `news_articles`
--
ALTER TABLE `news_articles`
  ADD CONSTRAINT `news_articles_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `result_approval_batches`
--
ALTER TABLE `result_approval_batches`
  ADD CONSTRAINT `fk_result_batch_offering` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_result_batch_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_result_batch_submitter` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `result_approval_items`
--
ALTER TABLE `result_approval_items`
  ADD CONSTRAINT `fk_approval_item_batch` FOREIGN KEY (`approval_batch_id`) REFERENCES `result_approval_batches` (`approval_batch_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_approval_item_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `role_permission_map`
--
ALTER TABLE `role_permission_map`
  ADD CONSTRAINT `fk_rpm_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rpm_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `room_booking_exceptions`
--
ALTER TABLE `room_booking_exceptions`
  ADD CONSTRAINT `fk_room_exception_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_room_exception_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON UPDATE CASCADE;

--
-- Constraints for table `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `semesters_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `spreadsheet_templates`
--
ALTER TABLE `spreadsheet_templates`
  ADD CONSTRAINT `fk_spreadsheet_template_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `staff_attendance`
--
ALTER TABLE `staff_attendance`
  ADD CONSTRAINT `staff_attendance_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  ADD CONSTRAINT `staff_attendance_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `staff_leave_requests`
--
ALTER TABLE `staff_leave_requests`
  ADD CONSTRAINT `fk_staff_leave_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_staff_leave_staff` FOREIGN KEY (`staff_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_academic_enrollments`
--
ALTER TABLE `student_academic_enrollments`
  ADD CONSTRAINT `fk_sae_group` FOREIGN KEY (`class_group_id`) REFERENCES `class_groups` (`class_group_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sae_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sae_recorder` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sae_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sae_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD CONSTRAINT `fk_student_documents_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_documents_user` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_import_batches`
--
ALTER TABLE `student_import_batches`
  ADD CONSTRAINT `fk_student_import_batches_user` FOREIGN KEY (`imported_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_import_errors`
--
ALTER TABLE `student_import_errors`
  ADD CONSTRAINT `fk_student_import_errors_batch` FOREIGN KEY (`batch_id`) REFERENCES `student_import_batches` (`batch_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_service_requests`
--
ALTER TABLE `student_service_requests`
  ADD CONSTRAINT `fk_service_request_assignee` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_service_request_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `fk_teachers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_offering_assignments`
--
ALTER TABLE `teacher_offering_assignments`
  ADD CONSTRAINT `fk_toa_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_toa_offering` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_toa_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `teacher_qualifications`
--
ALTER TABLE `teacher_qualifications`
  ADD CONSTRAINT `teacher_qualifications_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- Constraints for table `timetable_entries`
--
ALTER TABLE `timetable_entries`
  ADD CONSTRAINT `timetable_entries_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timetable_room_assignments`
--
ALTER TABLE `timetable_room_assignments`
  ADD CONSTRAINT `fk_timetable_room_assignee` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_timetable_room_slot` FOREIGN KEY (`timetable_slot_id`) REFERENCES `timetable_entries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_user_roles_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
