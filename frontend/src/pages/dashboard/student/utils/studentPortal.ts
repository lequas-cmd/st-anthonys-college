// Types and small formatting helpers for the student portal.
// Every field mirrors GET /api/dashboard/student/home (and the later
// /student/* endpoints) so the UI never invents data.

export type StudentTab =
  | "home"
  | "courses"
  | "grades"
  | "attendance"
  | "timetable"
  | "exams"
  | "announcements"
  | "transcript"
  | "profile";

export type StudentTerm = {
  id: number;
  name: string;
  academic_year: string;
  starts_on: string;
  ends_on: string;
  is_current: boolean;
};

export type StudentProfile = {
  id: number;
  student_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  photo_url: string | null;
  program: string;
  program_code: string | null;
  department: string | null;
  department_id: number | null;
  level_number: number | null;
  year_label: string | null;
  qualification_level: string | null;
  duration_years: number | null;
  class_group_id: number | null;
  enrollment_year: number | null;
  status: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
};

export type StudentClassSlot = {
  id: number;
  offering_id: number;
  course_code: string;
  course_title: string;
  section: string;
  teacher: string | null;
  starts_at: string;
  ends_at: string;
  room: string | null;
  status: string;
};

export type StudentExam = {
  id: number;
  assessment_title: string;
  assessment_type: string;
  max_score: number;
  course_code: string;
  course_title: string;
  section: string;
  exam_date: string;
  starts_at: string;
  ends_at: string;
  room: string | null;
  status: string;
};

export type StudentAnnouncement = {
  id: number;
  title: string;
  body: string;
  audience: string;
  published_at: string;
  scope: "college" | "department" | "class";
  is_read: boolean;
};

export type StudentLatestGrade = {
  grade_id: number;
  course_code: string;
  course_title: string;
  semester_name: string;
  assessment_title: string;
  score: number;
  max_score: number;
  percent: number | null;
  letter_grade: string;
  graded_at: string | null;
};

export type StudentAttendanceByClass = {
  offering_id: number;
  course_code: string;
  course_title: string;
  section: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
  total_sessions: number;
  percentage: number | null;
  below_threshold: boolean;
};

export type StudentHomeResponse = {
  student: StudentProfile;
  term: StudentTerm | null;
  settings: {
    attendance_threshold: number;
    grading_scale: string;
    grading_source: "database" | "default";
    max_gpa: number;
  };
  totals: {
    courses: number;
    unread_announcements: number;
    upcoming_exams: number;
    today_classes: number;
  };
  attendance: {
    percentage: number | null;
    present: number;
    late: number;
    absent: number;
    excused: number;
    total_sessions: number;
    threshold: number;
    below_threshold: boolean;
  };
  gpa: {
    current_term: number | null;
    cumulative: number | null;
    courses_counted: number;
  };
  today: {
    date: string | null;
    weekday: number | null;
    classes: StudentClassSlot[];
  };
  next_exam: StudentExam | null;
  announcements: StudentAnnouncement[];
  latest_grades: StudentLatestGrade[];
  attendance_by_class: StudentAttendanceByClass[];
};

/* ---------- formatting ---------- */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

/** Local calendar date from a MySQL DATE or DATE/DATETIME string. */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const match = DATE_ONLY.exec(String(value));
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** "08:30:00" -> "08:30" (the API returns MySQL TIME strings). */
export function formatTime(value?: string | null): string {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start) return "—";
  return end ? `${formatTime(start)}–${formatTime(end)}` : formatTime(start);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const rounded = Number(value).toFixed(digits);
  return `${rounded.replace(/\.0+$/, "")}%`;
}

export function formatGpa(value: number | null | undefined, max = 4): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return `${Number(value).toFixed(2)} / ${Number(max).toFixed(2)}`;
}

/** Just the GPA number, for the compact hero tile. */
export function formatGpaValue(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toFixed(2);
}

export function initialsOf(profile: Pick<StudentProfile, "first_name" | "last_name">): string {
  return `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() || "SA";
}

export function weekdayLabel(weekday: number | null): string {
  if (!weekday) return "";
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][weekday - 1] ?? "";
}

export function assessmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    test: "Test",
    quiz: "Quiz",
    project: "Project",
    midterm: "Midterm",
    final: "Final exam",
    practical: "Practical",
    other: "Assessment",
  };
  return labels[type] ?? "Assessment";
}

export function scopeLabel(scope: StudentAnnouncement["scope"]): string {
  if (scope === "class") return "Class";
  if (scope === "department") return "Department";
  return "College";
}

/* ---------- Additional page types ---------- */

export type StudentCourse = {
  offering_id: number;
  course_id: number;
  course_code: string;
  course_title: string;
  section: string;
  room: string | null;
  teacher: string | null;
  credit_hours: number;
  semester_id: number;
  semester_name: string;
  academic_year: string;
  status: string;
};

export type StudentCoursesResponse = {
  courses: StudentCourse[];
  term: { id: number; name: string; academic_year: string } | null;
};

export type StudentAssessment = {
  grade_id: number;
  assessment_id: number;
  title: string;
  type: string;
  score: number;
  max_score: number;
  weight_percent: number;
  percent: number | null;
  letter_grade: string;
  due_date: string | null;
  graded_at: string | null;
};

export type StudentCourseDetail = {
  course: StudentCourse;
  timetable: Array<{
    id: number;
    weekday: number;
    weekday_label: string;
    starts_at: string;
    ends_at: string;
    room: string | null;
    status: string;
  }>;
  grades: StudentAssessment[];
  summary: {
    percent: number | null;
    letter_grade: string | null;
    grade_point: number | null;
    weighted: boolean;
    assessments_count: number;
  } | null;
};

export type StudentGradesResponse = {
  courses: Array<{
    offering_id: number;
    course_code: string;
    course_title: string;
    section: string;
    teacher: string | null;
    credit_hours: number;
    semester_id: number;
    semester_name: string;
    academic_year: string;
    weighted: boolean;
    percent: number | null;
    letter_grade: string | null;
    grade_point: number | null;
    is_pass: boolean | null;
    assessments: StudentAssessment[];
  }>;
  grading: { scale_name: string; source: string; max_gpa: number };
  term: { id: number; name: string; academic_year: string } | null;
};

export type StudentAttendanceResponse = {
  threshold: number;
  overall: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    total_sessions: number;
    percentage: number | null;
    below_threshold: boolean;
  };
  by_class: StudentAttendanceByClass[];
  sessions: Array<{
    course_code: string;
    course_title: string;
    section: string;
    session_date: string;
    topic: string | null;
    status: string;
    recorded_at: string | null;
  }>;
};

export type StudentTimetableResponse = {
  entries: Array<{
    id: number;
    offering_id: number;
    course_code: string;
    course_title: string;
    section: string;
    teacher: string | null;
    weekday: number;
    weekday_label: string;
    starts_at: string;
    ends_at: string;
    room: string | null;
    status: string;
  }>;
  weekdays: string[];
};

export type StudentAnnouncementsResponse = {
  announcements: StudentAnnouncement[];
  unread_count: number;
};

export type TranscriptCourse = {
  course_code: string;
  course_title: string;
  section: string;
  credit_hours: number;
  percent: number | null;
  letter_grade: string | null;
  grade_point: number | null;
  is_pass: boolean | null;
  assessments: StudentAssessment[];
};

export type TranscriptTerm = {
  id: number;
  name: string;
  academic_year: string;
  starts_on: string;
  ends_on: string;
  is_current: boolean;
  published_at: string | null;
  gpa: number | null;
  courses: TranscriptCourse[];
};

export type StudentTranscriptResponse = {
  student: {
    id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    program: string;
    department: string | null;
  };
  terms: TranscriptTerm[];
  cumulative_gpa: number | null;
  cumulative_credits: number;
};

/** Short label for a status badge. */
export function statusTone(status: string): "success" | "warning" | "info" | "neutral" {
  const s = String(status).toLowerCase();
  if (s === "open" || s === "active" || s === "enrolled") return "success";
  if (s === "scheduled" || s === "present") return "success";
  if (s === "late" || s === "postponed") return "warning";
  if (s === "absent" || s === "cancelled" || s === "withdrawn") return "warning";
  return "info";
}

/** Percentage grade tone. */
export function gradeTone(letter: string | null | undefined): "success" | "warning" | "info" | "neutral" {
  if (!letter) return "info";
  if (letter === "A" || letter === "B") return "success";
  if (letter === "C") return "info";
  return "warning";
}

/** Attendance status chip tone. */
export function attendanceTone(status: string): "success" | "warning" | "info" | "neutral" {
  const s = String(status).toLowerCase();
  if (s === "present") return "success";
  if (s === "late") return "warning";
  if (s === "excused") return "info";
  return "warning";
}

/** Letter grade colour class. */
export function letterGradeClass(letter: string | null): string {
  if (!letter) return "";
  if (letter === "A" || letter === "B") return "sa-text-good";
  return "sa-text-warning";
}

