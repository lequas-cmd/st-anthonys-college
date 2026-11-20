import React, { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard-pages.css";
import { apiRequest } from "../../services/api";

type DashboardTab = "overview" | "schedules" | "grades" | "resources";

type StudentSummary = {
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
  resources: Array<{ id: number; title: string; description: string | null; category: string; file_url: string | null; audience: string }>;
  dailyAttendance: Array<{ date: string; status: string }>;
  attendance: { percentage: number; total_sessions: number; present: number; absent: number; late: number };
};

const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mysqlWeekdayName = (value: number) => weekdayNames[(value - 1 + 7) % 7] ?? "Day";
const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "schedules", label: "Schedules" },
  { id: "grades", label: "Grade Report" },
  { id: "resources", label: "Resources" },
];

const formatDateTime = (value: string | null) => {
  if (!value) return "No date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (value: string | null) => {
  if (!value) return "No date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const levelFromEnrollmentYear = (year: number | null) => {
  if (!year) return "Level N/A";
  const level = Math.max(1, new Date().getFullYear() - Number(year) + 1);
  return `Level ${level}`;
};

const getGradeLetter = (score: number | null) => {
  if (score === null || Number.isNaN(score)) return "—";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
};

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState<StudentSummary | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [termFilter, setTermFilter] = useState("Current semester");
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourceCategory, setResourceCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadStudent = async () => {
      try {
        const data = await apiRequest<StudentSummary>("/dashboard/student");
        if (active) {
          setDashboard(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load student data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStudent();
    return () => {
      active = false;
    };
  }, []);

  const student = dashboard?.student ?? null;
  const fullName = student ? `${student.first_name} ${student.last_name}`.trim() : "Student";
  const program = student?.program || "Program not assigned";
  const level = student?.enrollment_year ? levelFromEnrollmentYear(student.enrollment_year) : "Level N/A";
  const attendancePercent = dashboard?.attendance?.percentage ?? 0;

  const gradeRows = useMemo<Array<{ course: string; code: string; term: string; assessments: Array<{ title: string; score: number | null; max: number; weight: number | null }>; total: number; average: number; grade: string }>>(() => {
    if (!dashboard) return [];

    const map = new Map<string, { course: string; code: string; term: string; assessments: Array<{ title: string; score: number | null; max: number; weight: number | null }>; total: number; average: number; grade: string }>();

    dashboard.grades.forEach((row) => {
      const key = `${row.code}-${row.term_name}`;
      const current = map.get(key) ?? {
        course: row.course_title,
        code: row.code,
        term: row.term_name,
        assessments: [],
        total: 0,
        average: 0,
        grade: "",
      };

      current.assessments.push({
        title: row.assessment_title,
        score: row.score,
        max: row.max_score || 100,
        weight: row.weight_percent,
      });

      map.set(key, current);
    });

    return Array.from(map.values()).map((row) => {
      const totalScore = row.assessments.reduce((sum, item) => sum + (item.score ?? 0), 0);
      const average = row.assessments.length ? totalScore / row.assessments.length : 0;
      return {
        ...row,
        total: totalScore,
        average,
        grade: getGradeLetter(average),
      };
    });
  }, [dashboard]);

  const filteredGradeRows = useMemo(() => {
    if (!gradeRows.length) return [];
    if (termFilter === "All published terms") return gradeRows;
    if (termFilter === "Current semester") return gradeRows.filter((row) => row.term.toLowerCase().includes("semester") || row.term.toLowerCase().includes("current"));
    return gradeRows.filter((row) => row.term === termFilter);
  }, [gradeRows, termFilter]);

  const resourceCategories = useMemo(() => {
    const categories = new Set(["All", ...(dashboard?.resources ?? []).map((resource) => resource.category)]);
    return Array.from(categories);
  }, [dashboard]);

  const displayedResources = useMemo(() => {
    const list = dashboard?.resources ?? [];
    return list.filter((item) => {
      const matchCategory = resourceCategory === "All" || item.category === resourceCategory;
      const searchable = `${item.title} ${item.description ?? ""} ${item.category}`.toLowerCase();
      const matchQuery = searchable.includes(resourceQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [dashboard, resourceCategory, resourceQuery]);

  const gradeCourses = Array.from(new Set((dashboard?.modules ?? []).map((module) => `${module.code} — ${module.title}`)));

  const todayDate = new Date();
  const todayName = weekdayNames[(todayDate.getDay() + 6) % 7];
  const todaySchedule = (dashboard?.schedule ?? []).filter((entry) => mysqlWeekdayName(entry.weekday).toLowerCase() === todayName.toLowerCase());

  const attendanceDayMap = useMemo(() => {
    const map = new Map<string, string>();
    (dashboard?.dailyAttendance ?? []).forEach((entry) => {
      const key = new Date(entry.date).toISOString().slice(0, 10);
      if (key) {
        map.set(key, entry.status);
      }
    });
    return map;
  }, [dashboard]);

  const calendarMonth = useMemo(() => {
    const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const monthEnd = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
    const startOffset = (monthStart.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + monthEnd.getDate()) / 7) * 7;
    const cells: Array<{ date: Date | null; day: number | null }> = [];

    for (let index = 0; index < totalCells; index += 1) {
      const dayNumber = index - startOffset + 1;
      const currentDay = dayNumber > 0 && dayNumber <= monthEnd.getDate() ? new Date(todayDate.getFullYear(), todayDate.getMonth(), dayNumber) : null;
      cells.push({ date: currentDay, day: currentDay ? currentDay.getDate() : null });
    }

    return cells;
  }, [todayDate]);

  return (
    <div className="sa-dashboard">
      <aside className={`sa-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="sa-brand">
          <div className="sa-crest">SA</div>
          <div><strong>SAINT ANTHONY'S</strong><span>TECHNICAL COLLEGE</span></div>
          <button type="button" className="sa-sidebar-close" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="sa-role">STUDENT PORTAL</div>
        <nav className="sa-nav">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }} style={{ background: "transparent", border: "none", textAlign: "left", cursor: "pointer", padding: 0, display: "block", width: "100%" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12, color: activeTab === tab.id ? "#fff" : "#c4cdd7", textDecoration: "none", padding: "11px 12px", borderRadius: 5, fontSize: 12, transition: "background .15s,color .15s", width: "100%" }}>
                <span>{tab.id === "overview" ? "▦" : tab.id === "schedules" ? "▤" : tab.id === "grades" ? "▥" : "▧"}</span>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #314256" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <strong style={{ fontSize: 9, letterSpacing: "1.25px", color: "#d9e1eb", textTransform: "uppercase" }}>Latest notifications</strong>
            <span style={{ fontSize: 9, color: "#d0bd80" }}>View all</span>
          </div>

          {(dashboard?.announcements ?? []).length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(dashboard?.announcements ?? []).slice(0, 3).map((item) => (
                <div key={item.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 9px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 9, color: "#c6d0dd", lineHeight: 1.45 }}>{item.body.slice(0, 72)}{item.body.length > 72 ? "…" : ""}</div>
                  <div style={{ fontSize: 9, color: "#d0bd80", marginTop: 5 }}>{formatDate(item.published_at)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 10, color: "#becad5" }}>No new notifications.</div>
          )}
        </div>

        <div className="sa-sidebar-bottom"><div className="sa-help-icon">?</div><div><strong>Need help?</strong><span>Contact student support</span></div><span className="sa-chevron">›</span></div>
      </aside>

      <main className="sa-main">
        <header className="sa-topbar" style={{ height: 56, minHeight: 56, padding: "0 24px 0 28px" }}>
          <button
            type="button"
            className="sa-mobile-menu-toggle"
            aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            ☰
          </button>
          <div className="sa-breadcrumb" style={{ fontSize: 12 }}>Student Portal <span>/</span> {tabs.find((tab) => tab.id === activeTab)?.label}</div>
        </header>

        <section className="sa-content">
          {error && <div className="sa-alert-panel" style={{ marginBottom: 20 }}><strong>Live data unavailable:</strong> {error}</div>}

          <div className="sa-page-heading">
            <div>
              <div className="sa-eyebrow">{todayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}</div>
              <h1>Welcome {loading ? "Student" : student?.first_name || "Student"}</h1>
              <p>Here is your current academic overview, schedule, grades, and learning resources.</p>
            </div>
            <div className="sa-heading-actions">
              {activeTab === "grades" && (
                <select className="sa-select" value={termFilter} onChange={(event) => setTermFilter(event.target.value)}>
                  <option>Current semester</option>
                  <option>All published terms</option>
                  {Array.from(new Set(gradeRows.map((row) => row.term))).map((term) => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="sa-panel" style={{ padding: 18 }}>Loading student dashboard…</div>
          ) : !dashboard || !student ? (
            <div className="sa-panel" style={{ padding: 18 }}>No student profile is available for this account.</div>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  <section className="sa-student-hero" style={{ marginBottom: 22 }}>
                    <div className="sa-student-photo">{fullName.slice(0, 2).toUpperCase()}</div>
                    <div className="sa-student-intro">
                      <span className="sa-chip sa-chip-light">ACTIVE STUDENT</span>
                      <h2>{fullName}</h2>
                      <p>{program} · {level}</p>
                      <div className="sa-student-meta">
                        <span>Student ID <b>{student.student_number}</b></span>
                        <span>Section <b>{student.section || "A"}</b></span>
                        <span>Academic year <b>{dashboard.academic_year || student.academic_year || "2026/2027"}</b></span>
                        <span>Dormitory <b>{student.dormitory || "Dormitory A-01"}</b></span>
                      </div>
                    </div>
                    <div className="sa-gpa">
                      <span>ATTENDANCE</span>
                      <strong>{attendancePercent}%</strong>
                      <small>{dashboard.attendance?.present ?? 0} sessions attended</small>
                      <div className="sa-gpa-line"><i style={{ width: `${attendancePercent}%` }} /></div>
                    </div>
                  </section>

                  <div className="sa-stat-grid">
                    <article className="sa-stat-card"><div className="sa-stat-top"><span>Current program</span><b className="sa-stat-icon gold">▤</b></div><strong>{program}</strong><p>{level}</p></article>
                    <article className="sa-stat-card"><div className="sa-stat-top"><span>Enrolled courses</span><b className="sa-stat-icon green">✓</b></div><strong>{dashboard.modules.length}</strong><p>Live records</p></article>
                    <article className="sa-stat-card"><div className="sa-stat-top"><span>Assignments due</span><b className="sa-stat-icon rose">◷</b></div><strong>{dashboard.tasks.length}</strong><p>Published tasks</p></article>
                    <article className="sa-stat-card"><div className="sa-stat-top"><span>Published grades</span><b className="sa-stat-icon blue">▥</b></div><strong>{dashboard.grades.length}</strong><p>Visible to students</p></article>
                  </div>

                  <div className="sa-student-grid">
                    <section className="sa-panel" style={{ minWidth: 0 }}>
                      <div className="sa-panel-heading"><h3>Attendance calendar</h3><button className="sa-link-button" type="button">Month view</button></div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6, marginBottom: 12 }}>
                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => (
                          <div key={day} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#55657b", paddingBottom: 4 }}>{day}</div>
                        ))}
                        {calendarMonth.map((cell, index) => {
                          const isoKey = cell.date ? cell.date.toISOString().slice(0, 10) : '';
                          const status = cell.date ? attendanceDayMap.get(isoKey) : undefined;
                          const tileStyle: React.CSSProperties = {
                            minHeight: 42,
                            borderRadius: 8,
                            border: "1px solid #e7e5de",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            background: !cell.date ? "#f5f3ef" : status === 'present' ? "#dff3ea" : status === 'late' ? "#fff3d8" : status === 'absent' ? "#f8d9d7" : "#eef3f9",
                            color: !cell.date ? "#c0c4ca" : "#1e2e3e",
                          };

                          return (
                            <div key={`${cell.day ?? 'empty'}-${index}`} style={tileStyle}>
                              {cell.day ?? ''}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "#566a7b" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><em style={{ width: 10, height: 10, display: "inline-block", borderRadius: 3, background: "#dff3ea" }} /> Present</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><em style={{ width: 10, height: 10, display: "inline-block", borderRadius: 3, background: "#fff3d8" }} /> Late</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><em style={{ width: 10, height: 10, display: "inline-block", borderRadius: 3, background: "#f8d9d7" }} /> Absent</span>
                      </div>
                    </section>

                    <section className="sa-panel">
                      <div className="sa-panel-heading"><h3>Today’s schedule</h3><button className="sa-link-button" type="button">View full timetable →</button></div>
                      <div className="sa-task-list">
                        {todaySchedule.length ? todaySchedule.map((entry) => (
                          <div key={`${entry.code}-${entry.starts_at}-${entry.weekday}`} className="sa-task-row">
                            <div className="sa-task-dot">▤</div>
                            <div className="sa-task-info">
                              <strong>{entry.course_title}</strong>
                              <small>{entry.code} · {entry.teacher || "Instructor not assigned"}</small>
                              <p style={{ margin: "4px 0 0", color: "#53657a" }}>{entry.starts_at} - {entry.ends_at} · {entry.room || "Room TBA"}</p>
                            </div>
                          </div>
                        )) : <div>No classes are scheduled for today.</div>}
                      </div>
                    </section>
                  </div>

                  <div className="sa-student-grid">
                    <section className="sa-panel">
                      <div className="sa-panel-heading"><h3>Grade report preview</h3><button className="sa-link-button" type="button">Full report →</button></div>
                      <table className="sa-table" style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Assessment</th>
                            <th>Total</th>
                            <th>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradeRows.slice(0, 4).map((row, index) => (
                            <tr key={`${row.code}-${index}`}>
                              <td>{row.course}</td>
                              <td>{row.assessments[0]?.title || "Published assessment"}</td>
                              <td>{Math.round(row.average)}</td>
                              <td><span className="sa-badge success">{row.grade}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>

                    <section className="sa-panel" style={{ marginTop: 0 }}>
                      <div className="sa-panel-heading"><h3>Upcoming assignments & deadlines</h3><button className="sa-link-button" type="button">Manage tasks →</button></div>
                      <div className="sa-task-list">
                        {(dashboard.tasks ?? []).map((task) => (
                          <div key={`${task.title}-${task.course}`} className="sa-task-row">
                            <div className="sa-task-dot">◷</div>
                            <div className="sa-task-info">
                              <strong>{task.title}</strong>
                              <span>{task.course}</span>
                              <small>{task.due}</small>
                            </div>
                            <span className={`sa-badge ${task.tone}`}>{task.status}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {activeTab === "schedules" && (
                <>
                  <section className="sa-panel" style={{ marginBottom: 20 }}>
                    <div className="sa-panel-heading"><h3>Weekly timetable</h3><button className="sa-link-button" type="button">Current semester</button></div>
                    <div style={{ overflowX: "auto" }}>
                      <table className="sa-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                        <thead>
                          <tr>
                            <th>Day</th>
                            <th>Course</th>
                            <th>Time</th>
                            <th>Classroom</th>
                            <th>Teacher</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(dashboard.schedule ?? []).map((entry, index) => (
                            <tr key={`${entry.course_title}-${entry.weekday}-${index}`}>
                              <td>{mysqlWeekdayName(entry.weekday)}</td>
                              <td>{entry.course_title} ({entry.code})</td>
                              <td>{entry.starts_at} - {entry.ends_at}</td>
                              <td>{entry.room || "TBA"}</td>
                              <td>{entry.teacher || "Instructor not assigned"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <div className="sa-student-grid">
                    <section className="sa-panel">
                      <div className="sa-panel-heading"><h3>Attendance summary</h3><button className="sa-link-button" type="button">Updated today</button></div>
                      <div className="sa-stat-card" style={{ marginBottom: 10 }}>
                        <div className="sa-stat-top"><span>Attendance rate</span><b className="sa-stat-icon green">✓</b></div>
                        <strong>{dashboard.attendance.percentage}%</strong>
                        <p>{dashboard.attendance.present} present · {dashboard.attendance.absent} absent · {dashboard.attendance.late} late</p>
                      </div>
                    </section>

                    <section className="sa-panel">
                      <div className="sa-panel-heading"><h3>Notifications</h3><button className="sa-link-button" type="button">View all →</button></div>
                      <div className="sa-task-list">
                        {(dashboard.announcements ?? []).map((announcement) => (
                          <div key={announcement.id} className="sa-task-row" style={{ alignItems: "flex-start" }}>
                            <div className="sa-task-dot">◉</div>
                            <div className="sa-task-info">
                              <strong>{announcement.title}</strong>
                              <small>{formatDate(announcement.published_at)}</small>
                              <p style={{ margin: "4px 0 0", color: "#53657a" }}>{announcement.body.slice(0, 110)}{announcement.body.length > 110 ? "…" : ""}</p>
                            </div>
                            <a href={announcement.link_url} className="sa-badge success" style={{ textDecoration: "none" }}>Read</a>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {activeTab === "grades" && (
                <section className="sa-panel">
                  <div className="sa-panel-heading"><h3>Published grade report</h3><span className="sa-badge success">College grading rule: pass mark 50%</span></div>
                  {gradeCourses.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "0 0 18px" }}>
                      {gradeCourses.map((course) => (
                        <span key={course} className="sa-badge" style={{ background: "#eef3f9", color: "#17314f", border: "1px solid #dfeaf4" }}>{course}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ overflowX: "auto" }}>
                    <table className="sa-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 780, border: "1px solid #e7e5de" }}>
                      <thead>
                        <tr>
                          <th style={{ border: "1px solid #e7e5de" }}>Course</th>
                          <th style={{ border: "1px solid #e7e5de" }}>Course code</th>
                          <th style={{ border: "1px solid #e7e5de" }}>Assessment</th>
                          <th style={{ border: "1px solid #e7e5de" }}>Total score</th>
                          <th style={{ border: "1px solid #e7e5de" }}>Grade</th>
                          <th style={{ border: "1px solid #e7e5de" }}>Term</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGradeRows.length ? filteredGradeRows.map((row, index) => (
                          <tr key={`${row.code}-${row.term}-${index}`}>
                            <td style={{ border: "1px solid #e7e5de" }}>{row.course}</td>
                            <td style={{ border: "1px solid #e7e5de" }}>{row.code}</td>
                            <td style={{ border: "1px solid #e7e5de" }}>{row.assessments.map((assessment) => assessment.title).join(", ") || "Published assessment"}</td>
                            <td style={{ border: "1px solid #e7e5de" }}>{Math.round(row.average)}%</td>
                            <td style={{ border: "1px solid #e7e5de" }}><span className="sa-badge success">{row.grade}</span></td>
                            <td style={{ border: "1px solid #e7e5de" }}>{row.term}</td>
                          </tr>
                        )) : <tr><td colSpan={6}>No published grades are available for the selected term.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === "resources" && (
                <>
                  <section className="sa-panel" style={{ marginBottom: 20 }}>
                    <div className="sa-panel-heading"><h3>Learning resources</h3><button className="sa-link-button" type="button">Open library</button></div>
                    <div className="sa-grade-toolbar" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                      <label className="sa-search" style={{ flex: 1, minWidth: 200 }}>
                        ⌕ <input value={resourceQuery} onChange={(event) => setResourceQuery(event.target.value)} placeholder="Search resources..." />
                      </label>
                      <select className="sa-select" value={resourceCategory} onChange={(event) => setResourceCategory(event.target.value)}>
                        {resourceCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sa-task-list">
                      {displayedResources.length ? displayedResources.map((resource) => (
                        <div key={resource.id} className="sa-task-row" style={{ alignItems: "flex-start" }}>
                          <div className="sa-task-dot">▣</div>
                          <div className="sa-task-info">
                            <strong>{resource.title}</strong>
                            <small>{resource.category}</small>
                            <p style={{ margin: "4px 0 0", color: "#53657a" }}>{resource.description || "Learning material for student support."}</p>
                          </div>
                          <a href={resource.file_url || "#"} target={resource.file_url ? "_blank" : undefined} rel={resource.file_url ? "noreferrer" : undefined} className="sa-badge success" style={{ textDecoration: "none" }}>
                            {resource.file_url ? "Open" : "View"}
                          </a>
                        </div>
                      )) : <div>No resources match your search.</div>}
                    </div>
                  </section>
                </>
              )}
            </>
          )}

          <footer className="sa-footer">© 2026 Saint Anthony’s Technical and Vocational College <span>Learning with skill, purpose, and service.</span></footer>
        </section>
      </main>
    </div>
  );
}
