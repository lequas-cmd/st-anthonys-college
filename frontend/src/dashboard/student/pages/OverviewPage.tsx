import React, { useMemo, useState } from "react";
import {
  AttendanceState, CalendarItem, CourseGrade, StudentSummary, WEEKDAYS_SHORT,
  addDays, attendanceGlyph, attendanceLabel, average, dateKey, expandClasses,
  formatClock, formatDate, formatDayLabel, formatPercent, letterGrade, normalizeAttendance,
  parseDate, sameDay, sortItems, startOfDay, startOfWeek, taskTypeLabel, PASS_MARK, weekdayIndex,
} from "../utils/studentUtils";

type Props = {
  data: StudentSummary;
  courses: CourseGrade[]; // already limited to the current semester
  onNavigate: (tab: "schedule" | "grades") => void;
};

/* ---------- attendance helpers ---------- */
function useDayState(data: StudentSummary) {
  const byDate = useMemo(() => {
    const m = new Map<string, AttendanceState>();
    data.dailyAttendance.forEach((e) => {
      const d = parseDate(e.date);
      const s = normalizeAttendance(e.status);
      if (d && s) m.set(dateKey(d), s);
    });
    return m;
  }, [data.dailyAttendance]);
  const classDays = useMemo(() => new Set(data.schedule.map((s) => weekdayIndex(s.weekday))), [data.schedule]);

  return (d: Date): AttendanceState => {
    const recorded = byDate.get(dateKey(d));
    if (recorded) return recorded;
    const idx = (d.getDay() + 6) % 7;
    if (!classDays.has(idx)) return "nonclass";
    return startOfDay(d).getTime() >= startOfDay(new Date()).getTime() ? "upcoming" : "norecord";
  };
}

const LEGEND: AttendanceState[] = ["present", "late", "absent", "excused", "norecord", "nonclass"];

function AttendanceTracker({ data }: { data: StudentSummary }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [mode, setMode] = useState<"week" | "history">("week");
  const stateOf = useDayState(data);
  const today = new Date();
  const thisWeek = startOfWeek(today);
  const weekStart = addDays(thisWeek, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const states = days.map(stateOf);

  const attended = states.filter((s) => s === "present" || s === "late").length;
  const absent = states.filter((s) => s === "absent").length;
  const excused = states.filter((s) => s === "excused").length;
  const counted = attended + absent; // excused days are neither attended nor held against the student
  const rate = counted ? Math.round((attended / counted) * 100) : null;

  const HISTORY_WEEKS = 12;
  const historyWeeks = Array.from({ length: HISTORY_WEEKS }, (_, i) => addDays(thisWeek, -(HISTORY_WEEKS - 1 - i) * 7));
  const rangeLabel = `${formatDayLabel(weekStart)} – ${formatDayLabel(addDays(weekStart, 6))}`;

  return (
    <section className="sa-panel sa-st-attendance" aria-labelledby="att-h">
      <div className="sa-panel-heading">
        <div>
          <h3 id="att-h">Attendance</h3>
          <p>{mode === "week" ? rangeLabel : `Last ${HISTORY_WEEKS} weeks`}</p>
        </div>
        <div className="sa-st-seg" role="group" aria-label="Attendance view">
          <button type="button" aria-pressed={mode === "week"} onClick={() => setMode("week")}>Week</button>
          <button type="button" aria-pressed={mode === "history"} onClick={() => setMode("history")}>History</button>
        </div>
      </div>

      {mode === "week" ? (
        <>
          <div className="sa-st-weekrow">
            {days.map((d, i) => {
              const s = states[i];
              return (
                <div key={dateKey(d)} className={`sa-st-day is-${s}${sameDay(d, today) ? " is-today" : ""}`}
                  role="img" aria-label={`${formatDayLabel(d)}: ${attendanceLabel[s]}`} title={`${formatDayLabel(d)} — ${attendanceLabel[s]}`}>
                  <span className="sa-st-day-name">{WEEKDAYS_SHORT[i]}</span>
                  <span className="sa-st-day-cell" aria-hidden="true">{attendanceGlyph[s]}</span>
                  <span className="sa-st-day-num">{d.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="sa-st-attsummary">
            <span><b>{attended}</b> attended</span>
            <span><b>{absent}</b> absent</span>
            {excused > 0 && <span><b>{excused}</b> excused</span>}
            <span className="sa-st-rate">Weekly rate <b>{rate === null ? "—" : `${rate}%`}</b></span>
          </div>
          <div className="sa-st-attnav">
            <button type="button" className="sa-link-button" onClick={() => setWeekOffset((w) => w - 1)}>← Previous week</button>
            <button type="button" className="sa-link-button" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)}>This week</button>
            <button type="button" className="sa-link-button" disabled={weekOffset >= 0} onClick={() => setWeekOffset((w) => w + 1)}>Next week →</button>
          </div>
        </>
      ) : (
        <div className="sa-st-history" role="group" aria-label="Attendance history by week">
          <div className="sa-st-history-labels" aria-hidden="true">{WEEKDAYS_SHORT.map((d) => <span key={d}>{d}</span>)}</div>
          {historyWeeks.map((ws) => (
            <button type="button" key={dateKey(ws)} className="sa-st-history-col"
              aria-label={`Week of ${formatDate(ws)} — open this week`}
              onClick={() => { setMode("week"); setWeekOffset(Math.round((ws.getTime() - thisWeek.getTime()) / (7 * 86400000))); }}>
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(ws, i);
                const s = stateOf(d);
                return <i key={i} className={`is-${s}`} title={`${formatDayLabel(d)} — ${attendanceLabel[s]}`} />;
              })}
              <small>{ws.getDate()}/{ws.getMonth() + 1}</small>
            </button>
          ))}
        </div>
      )}

      <ul className="sa-st-legend" aria-label="Attendance legend">
        {LEGEND.map((s) => (
          <li key={s}><i className={`sa-st-swatch is-${s}`} aria-hidden="true">{attendanceGlyph[s]}</i>{attendanceLabel[s]}</li>
        ))}
      </ul>
      <p className="sa-st-footnote">
        Overall this semester: <b>{data.attendance.percentage}%</b> ({data.attendance.present} present, {data.attendance.late} late, {data.attendance.absent} absent of {data.attendance.total_sessions} sessions).
      </p>
    </section>
  );
}

/* ---------- this week's classes ---------- */
function WeekSchedule({ data, onNavigate }: { data: StudentSummary; onNavigate: Props["onNavigate"] }) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const items = useMemo(() => sortItems(expandClasses(data.schedule, weekStart, addDays(weekStart, 6))), [data.schedule]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = items.find((i) => i.end && i.end.getTime() > now.getTime());
  const statusOf = (i: CalendarItem) => {
    if (i.end && i.end.getTime() <= now.getTime()) return "Completed";
    if (i.start.getTime() <= now.getTime()) return "In progress";
    return i === next ? "Next up" : "";
  };

  return (
    <section className="sa-panel" aria-labelledby="week-h">
      <div className="sa-panel-heading">
        <div><h3 id="week-h">This week’s classes</h3><p>{formatDayLabel(weekStart)} – {formatDayLabel(addDays(weekStart, 6))}</p></div>
        <button type="button" className="sa-link-button" onClick={() => onNavigate("schedule")}>Full schedule →</button>
      </div>
      {items.length === 0 ? (
        <p className="sa-st-empty">No classes are scheduled this week.</p>
      ) : (
        <div className="sa-task-list">
          {items.map((i) => {
            const status = statusOf(i);
            return (
              <div key={i.id} className={`sa-task-row sa-st-classrow${i === next ? " is-next" : ""}${status === "Completed" ? " is-done" : ""}`}>
                <div className="sa-task-dot" aria-hidden="true">{WEEKDAYS_SHORT[(i.start.getDay() + 6) % 7].slice(0, 2)}</div>
                <div className="sa-task-info">
                  <strong>{i.title}</strong>
                  <span>{formatClock(i.start)}–{i.end ? formatClock(i.end) : ""} · {i.location || "Room TBA"}</span>
                  <small>{i.instructor || "Instructor not assigned"}</small>
                </div>
                {status && <span className={`sa-badge ${status === "Next up" || status === "In progress" ? "info" : "success"}`}>{status}</span>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------- upcoming tasks ---------- */
const doneWords = /submitted|completed|graded|done/i;

function UpcomingTasks({ data }: { data: StudentSummary }) {
  const now = new Date();
  const rows = useMemo(() => {
    return data.tasks.map((t) => {
      const due = parseDate(t.due);
      const done = doneWords.test(t.status) || t.tone === "success";
      const overdue = !done && !!due && due.getTime() < now.getTime();
      const soon = !done && !overdue && !!due && due.getTime() - now.getTime() < 3 * 86400000;
      const group = done ? 3 : overdue ? 0 : 1;
      return { ...t, dueDate: due, done, overdue, soon, group };
    }).sort((a, b) => a.group - b.group || (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
  }, [data.tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="sa-panel" aria-labelledby="tasks-h">
      <div className="sa-panel-heading">
        <div><h3 id="tasks-h">Upcoming assessments & assignments</h3><p>Overdue first, then by due date</p></div>
      </div>
      {rows.length === 0 ? (
        <p className="sa-st-empty">Nothing is due right now.</p>
      ) : (
        <div className="sa-task-list">
          {rows.map((t, i) => (
            <div key={`${t.title}-${i}`} className={`sa-task-row sa-st-taskrow${t.overdue ? " is-overdue" : t.soon ? " is-soon" : ""}${t.done ? " is-done" : ""}`}>
              <div className="sa-task-dot" aria-hidden="true">{t.done ? "✓" : t.overdue ? "!" : "◷"}</div>
              <div className="sa-task-info">
                <strong>{t.title}</strong>
                <span>{t.course} · {taskTypeLabel(t.title)}</span>
                <small>{t.dueDate ? `Due ${formatDate(t.dueDate)}${t.dueDate.getHours() || t.dueDate.getMinutes() ? ", " + t.dueDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""}` : t.due || "No date"}</small>
              </div>
              <span className={`sa-badge ${t.overdue || t.soon ? "warning" : t.tone}`}>{t.overdue ? "Overdue" : t.soon ? "Due soon" : t.status}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- course performance ---------- */
function PerformanceTable({ courses, onNavigate }: { courses: CourseGrade[]; onNavigate: Props["onNavigate"] }) {
  const columns = useMemo(() => {
    const seen: string[] = [];
    courses.forEach((c) => c.assessments.forEach((a) => { if (!seen.includes(a.title)) seen.push(a.title); }));
    return seen;
  }, [courses]);

  return (
    <section className="sa-panel sa-st-flush" aria-labelledby="perf-h">
      <div className="sa-panel-heading sa-st-padded">
        <div><h3 id="perf-h">Course performance</h3><p>Current semester · scores shown as obtained / maximum</p></div>
        <button type="button" className="sa-link-button" onClick={() => onNavigate("grades")}>Full grade report →</button>
      </div>
      {courses.length === 0 ? (
        <p className="sa-st-empty">No grades have been published for this semester yet.</p>
      ) : (
        <div className="sa-table-wrap" tabIndex={0} role="region" aria-label="Course performance table, scrollable">
          <table className="sa-table sa-st-table sa-st-sticky">
            <thead>
              <tr>
                <th scope="col">Course</th>
                {columns.map((c) => <th scope="col" key={c} className="sa-st-num">{c}</th>)}
                <th scope="col" className="sa-st-num">Total to date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const pass = c.percent !== null && c.percent >= PASS_MARK;
                return (
                  <tr key={`${c.code}-${c.term}`}>
                    <th scope="row"><strong>{c.code}</strong><small>{c.course}</small></th>
                    {columns.map((col) => {
                      const a = c.assessments.find((x) => x.title === col);
                      if (!a) return <td key={col} className="sa-st-num sa-st-na" title="Not part of this course">n/a</td>;
                      if (a.score === null) return <td key={col} className="sa-st-num sa-st-pending" title="Not graded yet">pending</td>;
                      return <td key={col} className="sa-st-num"><b>{a.score}</b><span className="sa-st-max"> / {a.max}</span></td>;
                    })}
                    <td className="sa-st-num">
                      {c.percent === null ? <span className="sa-st-pending">—</span> : (
                        <><b className={pass ? "sa-text-good" : "sa-text-warning"}>{c.earned.toFixed(1)}</b><span className="sa-st-max"> / {c.gradedBasis.toFixed(c.weighted ? 0 : 0)}</span><small className="sa-st-block">{formatPercent(c.percent, 0)}</small></>
                      )}
                    </td>
                    <td>
                      {c.percent === null ? <span className="sa-badge info">No results yet</span>
                        : <span className={`sa-badge ${pass ? "success" : "warning"}`}>{c.complete ? (pass ? "Passed" : "Below pass mark") : pass ? "On track" : "Below pass mark"}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="sa-st-footnote sa-st-padded">
        “pending” = not graded yet (not a zero). “n/a” = the course has no such assessment. Totals use assessment weights where the course defines them; pass mark {PASS_MARK}%.
      </p>
    </section>
  );
}

/* ---------- notifications ---------- */
function Notifications() {
  const notes = [
    {
      title: "Tuition fee reminder",
      body: "Second installment is due on Oct 15.",
      type: "warning",
      time: "2h ago",
    },
    {
      title: "New grade published",
      body: "Data Structures midterm results are available.",
      type: "success",
      time: "5h ago",
    },
    {
      title: "Class cancelled",
      body: "Physics lab (Thu 10:00) is cancelled.",
      type: "info",
      time: "1d ago",
    },
    {
      title: "Library hold",
      body: "Return overdue books by Friday to avoid fines.",
      type: "warning",
      time: "3d ago",
    },
  ];

  return (
    <section className="sa-panel" aria-labelledby="notif-h">
      <div className="sa-panel-heading">
        <div>
          <h3 id="notif-h">Notifications</h3>
          <p>Recent updates and reminders</p>
        </div>
      </div>
      <div className="sa-notification-list">
        {notes.map((n, i) => (
          <div key={i} className={`sa-notification-card sa-notif-${n.type}`}>
            <div className="sa-notification-info">
              <strong>{n.title}</strong>
              <span>{n.body}</span>
            </div>
            <span className="sa-notification-time">{n.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- page ---------- */
export default function OverviewPage({ data, courses, onNavigate }: Props) {
  const s = data.student!;
  const fullName = `${s.first_name} ${s.last_name}`.trim();
  const semesterAvg = average(courses.map((c) => c.percent));
  const level = s.enrollment_year ? `Level ${Math.max(1, new Date().getFullYear() - Number(s.enrollment_year) + 1)}` : null;

  return (
    <>
      <section className="sa-student-hero sa-st-hero" aria-label="Student profile">
        <div className="sa-student-photo" aria-hidden="true">{fullName.slice(0, 2).toUpperCase()}</div>
        <div className="sa-student-intro">
          <span className="sa-chip sa-chip-light">{(s.status || "ACTIVE STUDENT").toUpperCase()}</span>
          <h2 title={fullName}>{fullName}</h2>
          <p>{[s.program, level].filter(Boolean).join(" · ") || "Program not assigned"}</p>
          <div className="sa-student-meta">
            <span>Student ID <b>{s.student_number}</b></span>
            <span>Section <b>{s.section || "—"}</b></span>
            <span>Academic year <b>{data.academic_year || s.academic_year || "—"}</b></span>
            <span>Dormitory <b>{s.dormitory || "Not assigned"}</b></span>
          </div>
        </div>
        <div className="sa-gpa">
          <span>ATTENDANCE</span>
          <strong>{data.attendance.percentage}%</strong>
          <small>{data.attendance.present} sessions attended</small>
          <div className="sa-gpa-line"><i style={{ width: `${Math.min(100, data.attendance.percentage)}%` }} /></div>
        </div>
        <div className="sa-gpa">
          <span>SEMESTER AVERAGE</span>
          <strong>{semesterAvg === null ? "—" : `${semesterAvg.toFixed(0)}%`}</strong>
          <small>{letterGrade(semesterAvg) !== "—" ? `Grade ${letterGrade(semesterAvg)} · ${courses.length} courses` : "No results yet"}</small>
          <div className="sa-gpa-line"><i style={{ width: `${semesterAvg ?? 0}%` }} /></div>
        </div>
      </section>

      <div className="sa-st-grid2">
        <AttendanceTracker data={data} />
        <WeekSchedule data={data} onNavigate={onNavigate} />
      </div>
      <div className="sa-st-grid2">
        <UpcomingTasks data={data} />
        <Notifications />
      </div>
      <PerformanceTable courses={courses} onNavigate={onNavigate} />
    </>
  );
}
