import React from "react";
import type { TeacherDashboardResponse } from "../TeacherDashboard";

type Props = { data: TeacherDashboardResponse | null; loading: boolean; };

export default function OverviewPage({ data, loading }: Props) {
  const classes = data?.classes ?? [];
  const announcements = data?.announcements ?? [];
  const nextClass = classes
    .flatMap((course) => course.timetable.map((slot) => ({ ...slot, course: course.course_title, section: course.section })))
    .find((slot) => slot.day);
  const pendingGrades = data?.totals.pending_grades ?? 0;
  const lowAttendance = data?.totals.low_attendance ?? 0;

  return (
    <div className="sa-st-report">
      {loading ? (
        <div className="sa-skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <article key={i} className="sa-skeleton-stat-card">
              <div className="sa-skeleton-icon sa-skeleton-circle" />
              <div className="sa-skeleton-text sa-skeleton-lg" />
              <div className="sa-skeleton-text sa-skeleton-sm" />
            </article>
          ))}
        </div>
      ) : (
        <div className="sa-stat-grid">
          <article className="sa-stat-card">
            <div className="sa-stat-top"><span>Assigned courses</span><b className="sa-stat-icon gold">▤</b></div>
            <strong>{data?.totals.courses ?? 0}</strong>
            <p><span className="sa-text-good">↗ live</span> active sections in the current term</p>
          </article>

          <article className="sa-stat-card">
            <div className="sa-stat-top"><span>Pending grades</span><b className="sa-stat-icon blue">◷</b></div>
            <strong>{pendingGrades}</strong>
            <p>Unsubmitted or incomplete assessments</p>
          </article>

          <article className="sa-stat-card">
            <div className="sa-stat-top"><span>Low attendance</span><b className="sa-stat-icon green">✓</b></div>
            <strong>{lowAttendance}</strong>
            <p>Students below the recommended threshold</p>
          </article>

          <article className="sa-stat-card">
            <div className="sa-stat-top"><span>Next class</span><b className="sa-stat-icon rose">◍</b></div>
            <strong className="sa-date-stat">{nextClass ? nextClass.day : "—"}</strong>
            <p>{nextClass ? `${nextClass.course} • ${nextClass.time}` : "No scheduled class"}</p>
          </article>
        </div>
      )}

      <div className="sa-st-grid2">
        <section className="sa-panel" aria-labelledby="teacher-overview-classes">
          <div className="sa-panel-heading">
            <div>
              <h3 id="teacher-overview-classes">My courses today</h3>
              <p>Upcoming teaching responsibilities</p>
            </div>
            <a href="#classes">Manage courses →</a>
          </div>

          <div className="sa-task-list">
            {classes.length ? (
              classes.slice(0, 4).map((course) => (
                <div key={course.id} className="sa-task-row">
                  <div className="sa-task-dot" aria-hidden="true">{course.course_code.slice(0, 2)}</div>
                  <div className="sa-task-info">
                    <strong>{course.course_title}</strong>
                    <span>{course.section} • {course.room}</span>
                    <small>{course.student_count} students • {course.next_class}</small>
                  </div>
                  <span className="sa-badge success">On track</span>
                </div>
              ))
            ) : (
              <div className="sa-task-row"><div className="sa-task-info"><strong>No classes assigned yet.</strong></div></div>
            )}
          </div>
        </section>

        <section className="sa-panel sa-alert-panel" aria-labelledby="teacher-overview-alerts">
          <div className="sa-panel-heading">
            <h3 id="teacher-overview-alerts">Action queue</h3>
            <span className="sa-badge warning">{pendingGrades} items</span>
          </div>

          <div className="sa-alert-item">
            <span className="sa-alert-symbol gold">◷</span>
            <div>
              <strong>Unmarked assessments</strong>
              <p>{pendingGrades} assessments still need grading before final review.</p>
              <small>Academic office</small>
            </div>
            <a href="#gradebook">Open →</a>
          </div>

          <div className="sa-alert-item">
            <span className="sa-alert-symbol blue">i</span>
            <div>
              <strong>Attendance flags</strong>
              <p>{lowAttendance} learners are below the attendance threshold.</p>
              <small>Student support</small>
            </div>
            <a href="#attendance">Review →</a>
          </div>

          <div className="sa-alert-item">
            <span className="sa-alert-symbol rose">!</span>
            <div>
              <strong>Announcements</strong>
              <p>{announcements.length} college notices are available to students.</p>
              <small>Faculty communication</small>
            </div>
            <a href="#announcements">Open →</a>
          </div>
        </section>
      </div>
    </div>
  );
}
