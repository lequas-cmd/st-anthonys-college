// Shared types and helpers for the student dashboard pages.
// Everything here is derived from the existing GET /dashboard/student response.

export type DashboardTab = "overview" | "schedule" | "grades" | "resources";

export type ResourceItem = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  audience: string;
  // Optional fields. The API does not return these yet; the UI shows the
  // matching columns/filters automatically once the backend adds them.
  course_code?: string | null;
  file_size_bytes?: number | null;
  updated_at?: string | null;
  uploaded_by?: string | null;
};

export type StudentSummary = {
  student: {
    student_number: string;
    first_name: string;
    last_name: string;
    program: string | null;
    enrollment_year: number | null;
    academic_year: string | null;
    section: string | null;
    dormitory: string | null;
    email: string | null;
    phone: string | null;
    status: string | null;
  } | null;
  academic_year: string | null;
  announcements: Array<{ id: number; title: string; body: string; published_at: string; link_url: string }>;
  calendar: Array<{ title: string; summary: string | null; starts_at: string; ends_at: string | null; location: string | null }>;
  modules: Array<{ code: string; title: string; teacher: string; progress: number; color: "gold" | "blue" | "green" | "rose" }>;
  schedule: Array<{ weekday: number; starts_at: string; ends_at: string; room: string | null; code: string; course_title: string; teacher: string | null }>;
  tasks: Array<{ title: string; course: string; due: string; status: string; tone: "warning" | "info" | "success" }>;
  grades: Array<{ code: string; course_title: string; term_name: string; assessment_title: string; max_score: number; score: number | null; weight_percent: number | null; due_date: string | null }>;
  resources: ResourceItem[];
  dailyAttendance: Array<{ date: string; status: string }>;
  attendance: { percentage: number; total_sessions: number; present: number; absent: number; late: number };
};

export const PASS_MARK = 50; // percent; taken from the existing "pass mark 50%" rule in the portal

/* ---------- dates ---------- */
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const WEEKDAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Existing convention in the portal: 1 = Monday ... 7 = Sunday.
export const weekdayIndex = (value: number) => (value - 1 + 7) % 7;

/** Local YYYY-MM-DD key (avoids the UTC shift of toISOString). */
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Monday-based start of week. */
export const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));
export const sameDay = (a: Date, b: Date) => dateKey(a) === dateKey(b);

export const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "08:30:00" -> minutes since midnight */
export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m || 0);
};
export const formatTime = (t: string) => t.slice(0, 5);
export const formatClock = (d: Date) =>
  d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
export const formatDate = (d: Date | string | null) => {
  const date = typeof d === "string" ? parseDate(d) : d;
  if (!date) return "No date";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
export const formatDayLabel = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const formatPercent = (n: number | null, digits = 1) => (n === null ? "—" : `${n.toFixed(digits)}%`);

/* ---------- grades ---------- */
export type Assessment = {
  title: string;
  score: number | null;
  max: number;
  weight: number | null;
  due: Date | null;
};

export type CourseGrade = {
  code: string;
  course: string;
  term: string;
  assessments: Assessment[];
  /** Weighted points earned so far (out of `weightGraded`), or raw points if no weights. */
  earned: number;
  /** Weight (or raw max) of graded assessments so far. */
  gradedBasis: number;
  /** Total weight (or raw max) of all assessments in the course. */
  totalBasis: number;
  weighted: boolean;
  /** Percentage of graded work, null if nothing is graded yet. */
  percent: number | null;
  gradedCount: number;
  complete: boolean;
};

export const buildCourseGrades = (grades: StudentSummary["grades"]): CourseGrade[] => {
  const map = new Map<string, CourseGrade>();
  grades.forEach((row) => {
    const key = `${row.code}__${row.term_name}`;
    const course =
      map.get(key) ??
      ({ code: row.code, course: row.course_title, term: row.term_name, assessments: [], earned: 0, gradedBasis: 0, totalBasis: 0, weighted: false, percent: null, gradedCount: 0, complete: false } as CourseGrade);
    course.assessments.push({
      title: row.assessment_title,
      score: row.score,
      max: row.max_score || 100,
      weight: row.weight_percent,
      due: parseDate(row.due_date),
    });
    map.set(key, course);
  });

  return Array.from(map.values()).map((c) => {
    const weighted = c.assessments.length > 0 && c.assessments.every((a) => a.weight !== null);
    let earned = 0;
    let gradedBasis = 0;
    let totalBasis = 0;
    let gradedCount = 0;
    c.assessments.forEach((a) => {
      const basis = weighted ? (a.weight as number) : a.max;
      totalBasis += basis;
      if (a.score !== null) {
        gradedCount += 1;
        gradedBasis += basis;
        earned += weighted ? (a.score / a.max) * basis : a.score;
      }
    });
    return {
      ...c,
      weighted,
      earned,
      gradedBasis,
      totalBasis,
      gradedCount,
      percent: gradedBasis > 0 ? (earned / gradedBasis) * 100 : null,
      complete: c.assessments.length > 0 && gradedCount === c.assessments.length,
    };
  });
};

/** Existing portal rule of thumb for "current semester" (term name contains semester/current). */
export const isCurrentTerm = (term: string) => /semester|current/i.test(term);

export const letterGrade = (percent: number | null) => {
  if (percent === null) return "—";
  if (percent >= 80) return "A";
  if (percent >= 70) return "B";
  if (percent >= 60) return "C";
  if (percent >= 50) return "D";
  return "F";
};

export const average = (values: Array<number | null>) => {
  const v = values.filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

export type GradeStatus = "published" | "pending" | "not-graded";
export const gradeStatus = (a: Assessment, now = new Date()): GradeStatus => {
  if (a.score !== null) return "published";
  if (a.due && a.due.getTime() < now.getTime()) return "pending";
  return "not-graded";
};
export const gradeStatusLabel: Record<GradeStatus, string> = {
  published: "Published",
  pending: "Pending",
  "not-graded": "Not yet graded",
};

/* ---------- attendance ---------- */
export type AttendanceState = "present" | "late" | "absent" | "excused" | "norecord" | "nonclass" | "upcoming";
export const attendanceLabel: Record<AttendanceState, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused",
  norecord: "No record",
  nonclass: "No class",
  upcoming: "Upcoming",
};
export const attendanceGlyph: Record<AttendanceState, string> = {
  present: "P",
  late: "L",
  absent: "A",
  excused: "E",
  norecord: "?",
  nonclass: "–",
  upcoming: "",
};

export const normalizeAttendance = (status: string | undefined): AttendanceState | null => {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s.startsWith("pres")) return "present";
  if (s.startsWith("late")) return "late";
  if (s.startsWith("abs")) return "absent";
  if (s.startsWith("exc")) return "excused";
  return null;
};

/* ---------- tasks & calendar ---------- */
export type ItemKind = "class" | "assessment" | "assignment" | "event";
export const kindLabel: Record<ItemKind, string> = {
  class: "Class",
  assessment: "Assessment",
  assignment: "Assignment",
  event: "College event",
};
/** Title-based classification; the API has no explicit type field yet. */
export const taskKind = (title: string): "assessment" | "assignment" =>
  /exam|test|quiz|midterm|final/i.test(title) ? "assessment" : "assignment";
export const taskTypeLabel = (title: string) => {
  if (/exam|midterm|final/i.test(title)) return "Examination";
  if (/quiz/i.test(title)) return "Quiz";
  if (/test/i.test(title)) return "Test";
  if (/project/i.test(title)) return "Project";
  return "Assignment";
};

export type CalendarItem = {
  id: string;
  kind: ItemKind;
  title: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
  course?: string;
  instructor?: string | null;
  location?: string | null;
  details?: string | null;
  status?: string | null;
  recurring?: boolean;
};

const atMinutes = (day: Date, minutes: number) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(minutes / 60), minutes % 60);

export const buildOneOffItems = (data: StudentSummary): CalendarItem[] => {
  const items: CalendarItem[] = [];
  const seen = new Set<string>();
  const push = (item: CalendarItem) => {
    const key = `${item.kind}|${item.title}|${item.course ?? ""}|${dateKey(item.start)}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  data.tasks.forEach((t, i) => {
    const due = parseDate(t.due);
    if (!due) return;
    push({
      id: `task-${i}`,
      kind: taskKind(t.title),
      title: t.title,
      start: due,
      end: null,
      allDay: due.getHours() === 0 && due.getMinutes() === 0,
      course: t.course,
      status: t.status,
    });
  });

  data.grades.forEach((g, i) => {
    const due = parseDate(g.due_date);
    if (!due) return;
    push({
      id: `grade-${i}`,
      kind: taskKind(g.assessment_title),
      title: g.assessment_title,
      start: due,
      end: null,
      allDay: due.getHours() === 0 && due.getMinutes() === 0,
      course: `${g.code} — ${g.course_title}`,
      status: g.score === null ? "Not yet graded" : "Graded",
    });
  });

  data.calendar.forEach((c, i) => {
    const start = parseDate(c.starts_at);
    if (!start) return;
    push({
      id: `event-${i}`,
      kind: "event",
      title: c.title,
      start,
      end: parseDate(c.ends_at),
      allDay: start.getHours() === 0 && start.getMinutes() === 0 && !c.ends_at,
      location: c.location,
      details: c.summary,
    });
  });

  return items;
};

/** Expand the weekly timetable into dated class items for [from, to] inclusive. */
export const expandClasses = (schedule: StudentSummary["schedule"], from: Date, to: Date): CalendarItem[] => {
  const items: CalendarItem[] = [];
  for (let d = startOfDay(from); d.getTime() <= to.getTime(); d = addDays(d, 1)) {
    const idx = (d.getDay() + 6) % 7;
    schedule.forEach((s, i) => {
      if (weekdayIndex(s.weekday) !== idx) return;
      items.push({
        id: `class-${i}-${dateKey(d)}`,
        kind: "class",
        title: s.course_title,
        start: atMinutes(d, timeToMinutes(s.starts_at)),
        end: atMinutes(d, timeToMinutes(s.ends_at)),
        allDay: false,
        course: `${s.code} — ${s.course_title}`,
        instructor: s.teacher,
        location: s.room,
        recurring: true,
      });
    });
  }
  return items;
};

export const sortItems = (items: CalendarItem[]) =>
  [...items].sort((a, b) => a.start.getTime() - b.start.getTime() || a.title.localeCompare(b.title));

/* ---------- resources ---------- */
export const resourceType = (url: string | null): { label: string; external: boolean } | null => {
  if (!url) return null;
  const clean = url.split(/[?#]/)[0];
  const ext = clean.includes(".") ? clean.split(".").pop()!.toLowerCase() : "";
  const files = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "txt", "csv", "png", "jpg", "jpeg"];
  if (files.includes(ext)) return { label: ext.toUpperCase(), external: false };
  return { label: "Link", external: true };
};
export const formatSize = (bytes: number | null | undefined) => {
  if (!bytes && bytes !== 0) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ---------- export ---------- */
export const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const body = rows.map((r) => r.map(escape).join(",")).join("\r\n");
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(["\ufeff" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/** Courses for the "current semester" (portal heuristic); falls back to all courses if no term matches. */
export const selectCurrentCourses = (courses: CourseGrade[]) => {
  const current = courses.filter((c) => isCurrentTerm(c.term));
  return current.length ? current : courses;
};
export const currentTermIsExplicit = (courses: CourseGrade[]) => courses.some((c) => isCurrentTerm(c.term));
