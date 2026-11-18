import React from "react";
import {
  StudentHomeResponse,
  StudentTab,
  assessmentTypeLabel,
  formatDate,
  formatDateTime,
  formatGpaValue,
  formatPercent,
  formatShortDate,
  formatTime,
  formatTimeRange,
  initialsOf,
  scopeLabel,
  weekdayLabel,
} from "../utils/studentPortal";

type Props = {
  data: StudentHomeResponse;
  onNavigate: (tab: StudentTab) => void;
};

/* ---------- hero ---------- */
function ProfileHero({ data }: { data: StudentHomeResponse }) {
  const { student, term, attendance, gpa, settings } = data;
  const attendancePercent = attendance.percentage;

  return (
    <section className="sa-student-hero sa-st-hero" aria-label="Student profile">
      <div className="sa-student-photo" aria-hidden="true">{initialsOf(student)}</div>
      <div className="sa-student-intro">
        <span className="sa-chip sa-chip-light">{String(student.status || "active").toUpperCase()}</span>
        <h2>{student.full_name}</h2>
        <p>{[student.program, student.year_label].filter(Boolean).join(" · ") || "Program not assigned"}</p>
        <div className="sa-student-meta">
          <span>Student ID <b>{student.student_number}</b></span>
          <span>Department <b>{student.department || "—"}</b></span>
          <span>Term <b>{term ? `${term.name} · ${term.academic_year}` : "Not set"}</b></span>
        </div>
      </div>
      <div className="sa-gpa">
        <span>ATTENDANCE</span>
        <strong>{formatPercent(attendancePercent)}</strong>
        <small>
          {attendance.total_sessions === 0
            ? "No sessions recorded yet"
            : attendance.below_threshold
              ? `Below the ${settings.attendance_threshold}% minimum`
              : `${attendance.present + attendance.late} of ${attendance.total_sessions} sessions attended`}
        </small>
      </div>
      <div className="sa-gpa">
        <span>TERM GPA</span>
        <strong>{formatGpaValue(gpa.current_term)}</strong>
        <small>
          {gpa.courses_counted
            ? `out of ${Number(settings.max_gpa).toFixed(2)} · ${gpa.courses_counted} course${gpa.courses_counted === 1 ? "" : "s"}`
            : "No published results yet"}
        </small>
      </div>
    </section>
  );
}

/* ---------- today's classes ---------- */
function TodayClasses({ data, onNavigate }: Props) {
  const { today } = data;
  const dayName = weekdayLabel(today.weekday) || (today.date ? formatDate(today.date) : "Today");

  return (
    <section className="sa-panel" aria-labelledby="today-h">
      <div className="sa-panel-heading">
        <div>
          <h3 id="today-h">Today’s classes</h3>
          <p>{dayName}{today.date ? ` · ${formatShortDate(today.date)}` : ""}</p>
        </div>
        <button type="button" className="sa-link-button" onClick={() => onNavigate("timetable")}>
          Full timetable →
        </button>
      </div>
      {today.classes.length === 0 ? (
        <p className="sa-st-empty">No classes are scheduled for today.</p>
      ) : (
        <div className="sa-task-list">
          {today.classes.map((slot) => (
            <div key={slot.id} className="sa-task-row sa-st-classrow">
              <div className="sa-task-dot" aria-hidden="true">{formatTime(slot.starts_at).slice(0, 2)}</div>
              <div className="sa-task-info">
                <strong>{slot.course_code} · {slot.course_title}</strong>
                <span>{formatTimeRange(slot.starts_at, slot.ends_at)} · {slot.room || "Room TBA"}</span>
                <small>{slot.teacher || "Instructor not assigned"} · Section {slot.section}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- next exam ---------- */
function NextExam({ data, onNavigate }: Props) {
  const exam = data.next_exam;

  return (
    <section className="sa-panel" aria-labelledby="exam-h">
      <div className="sa-panel-heading">
        <div>
          <h3 id="exam-h">Next exam</h3>
          <p>Nearest scheduled assessment</p>
        </div>
        <button type="button" className="sa-link-button" onClick={() => onNavigate("exams")}>
          All exams →
        </button>
      </div>
      {!exam ? (
        <p className="sa-st-empty">No exams have been scheduled yet.</p>
      ) : (
        <div className="sa-task-list">
          <div className="sa-task-row">
            <div className="sa-task-dot" aria-hidden="true">{formatDate(exam.exam_date).slice(0, 3)}</div>
            <div className="sa-task-info">
              <strong>{exam.course_code} · {exam.assessment_title}</strong>
              <span>{formatDate(exam.exam_date)} · {formatTimeRange(exam.starts_at, exam.ends_at)}</span>
              <small>{assessmentTypeLabel(exam.assessment_type)} · {exam.room || "Room TBA"}</small>
            </div>
            <span className="sa-badge info">{exam.status === "postponed" ? "Postponed" : "Scheduled"}</span>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- attendance summary ---------- */
function AttendanceSummary({ data, onNavigate }: Props) {
  const { attendance, settings, attendance_by_class } = data;

  return (
    <section className="sa-panel" aria-labelledby="att-h">
      <div className="sa-panel-heading">
        <div>
          <h3 id="att-h">Attendance</h3>
          <p>
            {formatPercent(attendance.percentage)} overall · minimum {settings.attendance_threshold}%
          </p>
        </div>
        <button type="button" className="sa-link-button" onClick={() => onNavigate("attendance")}>
          Details →
        </button>
      </div>

      <div className="sa-st-attsummary">
        <span><b>{attendance.present}</b> present</span>
        <span><b>{attendance.late}</b> late</span>
        <span><b>{attendance.absent}</b> absent</span>
        {attendance.excused > 0 && <span><b>{attendance.excused}</b> excused</span>}
        <span className="sa-st-rate">Rate <b>{formatPercent(attendance.percentage)}</b></span>
      </div>

      {attendance.below_threshold && (
        <p className="sa-st-footnote sa-text-warning">
          <b>Attendance warning:</b> your rate is below the {settings.attendance_threshold}% minimum. Contact your
          instructor or the registrar’s office.
        </p>
      )}

      {attendance_by_class.length === 0 ? (
        <p className="sa-st-footnote">No class attendance has been recorded yet.</p>
      ) : (
        <div className="sa-table-wrap" tabIndex={0} role="region" aria-label="Attendance by course, scrollable">
          <table className="sa-table sa-st-restable">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Present</th>
                <th scope="col">Late</th>
                <th scope="col">Absent</th>
                <th scope="col">Rate</th>
                <th scope="col">Standing</th>
              </tr>
            </thead>
            <tbody>
              {attendance_by_class.map((row) => (
                <tr key={row.offering_id}>
                  <td>
                    <strong>{row.course_code}</strong>
                    <small className="sa-st-block">{row.course_title}</small>
                  </td>
                  <td data-label="Present">{row.present}</td>
                  <td data-label="Late">{row.late}</td>
                  <td data-label="Absent">{row.absent}</td>
                  <td data-label="Rate">{formatPercent(row.percentage)}</td>
                  <td data-label="Standing">
                    {row.percentage == null ? (
                      <span className="sa-badge info">No sessions</span>
                    ) : row.below_threshold ? (
                      <span className="sa-badge warning">Below minimum</span>
                    ) : (
                      <span className="sa-badge success">On track</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ---------- latest published grades ---------- */
function LatestGrades({ data, onNavigate }: Props) {
  const grades = data.latest_grades;

  return (
    <section className="sa-panel sa-st-flush" aria-labelledby="grades-h">
      <div className="sa-panel-heading sa-st-padded">
        <div>
          <h3 id="grades-h">Latest published grades</h3>
          <p>Only results submitted by your instructor and published</p>
        </div>
        <button type="button" className="sa-link-button" onClick={() => onNavigate("grades")}>
          All grades →
        </button>
      </div>
      {grades.length === 0 ? (
        <p className="sa-st-empty">No grades have been published yet.</p>
      ) : (
        <div className="sa-table-wrap" tabIndex={0} role="region" aria-label="Latest grades, scrollable">
          <table className="sa-table sa-st-restable">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Assessment</th>
                <th scope="col">Score</th>
                <th scope="col">Grade</th>
                <th scope="col">Published</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.grade_id}>
                  <td>
                    <strong>{grade.course_code}</strong>
                    <small className="sa-st-block">{grade.course_title}</small>
                  </td>
                  <td data-label="Assessment">{grade.assessment_title}</td>
                  <td data-label="Score">
                    <b>{grade.score}</b>
                    <span className="sa-st-max"> / {grade.max_score}</span>
                  </td>
                  <td data-label="Grade">
                    <span className="sa-badge info">{grade.letter_grade}</span>
                  </td>
                  <td data-label="Published">{formatDateTime(grade.graded_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="sa-st-footnote sa-st-padded">
        Scores appear here after your instructor submits them and the college publishes the result.
      </p>
    </section>
  );
}

/* ---------- announcements ---------- */
function RecentAnnouncements({ data, onNavigate }: Props) {
  const announcements = data.announcements.slice(0, 4);

  return (
    <section className="sa-panel" aria-labelledby="ann-h">
      <div className="sa-panel-heading">
        <div>
          <h3 id="ann-h">Recent announcements</h3>
          <p>
            {data.totals.unread_announcements
              ? `${data.totals.unread_announcements} unread · college, department and class notices`
              : "College, department and class notices"}
          </p>
        </div>
        <button type="button" className="sa-link-button" onClick={() => onNavigate("announcements")}>
          View all →
        </button>
      </div>
      {announcements.length === 0 ? (
        <p className="sa-st-empty">No announcements have been published yet.</p>
      ) : (
        <div className="sa-task-list">
          {announcements.map((note) => (
            <div key={note.id} className={`sa-task-row${note.is_read ? " is-done" : ""}`}>
              <div className="sa-task-dot" aria-hidden="true">{note.is_read ? "✓" : "•"}</div>
              <div className="sa-task-info">
                <strong>{note.title}</strong>
                <span>{note.body}</span>
                <small>{formatDate(note.published_at)} · {scopeLabel(note.scope)}</small>
              </div>
              <span className={`sa-badge ${note.is_read ? "success" : "info"}`}>
                {note.is_read ? "Read" : "Unread"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage(props: Props) {
  return (
    <>
      <ProfileHero data={props.data} />
      <div className="sa-st-grid2">
        <TodayClasses {...props} />
        <NextExam {...props} />
      </div>
      <div className="sa-st-grid2">
        <AttendanceSummary {...props} />
        <LatestGrades {...props} />
      </div>
      <RecentAnnouncements {...props} />
    </>
  );
}
