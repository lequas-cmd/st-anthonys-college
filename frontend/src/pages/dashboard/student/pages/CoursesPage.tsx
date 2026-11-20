import React, { useEffect, useState } from "react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import {
  StudentCourse,
  StudentCourseDetail,
  StudentCoursesResponse,
  assessmentTypeLabel,
  formatTimeRange,
  formatShortDate,
  formatPercent,
  gradeTone,
  letterGradeClass,
  statusTone,
} from "../utils/studentPortal";

/* ---------- course card (list view) ---------- */
function CourseCard({ course, onOpen }: { course: StudentCourse; onOpen: (c: StudentCourse) => void }) {
  return (
    <article
      className="sa-course-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(course); }}
      onClick={() => onOpen(course)}
    >
      <div className="course-head">
        <div className="course-code">{course.course_code}</div>
        <span className={`course-badge ${statusTone(course.status)}`}>{course.status}</span>
      </div>
      <div className="course-title">{course.course_title}</div>
      <div className="course-meta">
        <span>Section {course.section}</span>
        <span>·</span>
        <span>{course.teacher || "Instructor TBA"}</span>
        <span>·</span>
        <span>{course.room || "Room TBA"}</span>
      </div>
      <div className="course-footer">
        {course.percent != null ? (
          <>
            <span className="course-percent">{formatPercent(course.percent)}</span>
            <span className={`course-grade ${gradeTone(course.letter_grade ?? "")}`}>
              {course.letter_grade}
            </span>
          </>
        ) : (
          <span className="course-percent">—</span>
        )}
      </div>
    </article>
  );
}

/* ---------- course list ---------- */
function CoursesList({ courses, onOpen }: { courses: StudentCourse[]; onOpen: (c: StudentCourse) => void }) {
  if (courses.length === 0) {
    return (
      <section className="sa-card" aria-labelledby="courses-h">
        <div className="sa-card-heading">
          <div><h3 id="courses-h">My courses</h3><p>Registrar-enrolled classes this college year.</p></div>
        </div>
        <p className="sa-st-empty">You are not currently enrolled in any courses.</p>
      </section>
    );
  }
  return (
    <section className="sa-card" aria-labelledby="courses-h">
      <div className="sa-card-heading">
        <div><h3 id="courses-h">My courses</h3><p>Registrar-enrolled classes this college year.</p></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--sp-4)" }}>
        {courses.map((course) => (
          <CourseCard key={course.offering_id} course={course} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

/* ---------- course detail ---------- */
function CourseDetail({ course, onBack }: { course: StudentCourseDetail; onBack: () => void }) {
  const { course: c, timetable, grades, summary } = course;

  return (
    <>
      <button type="button" className="sa-link-button" onClick={onBack}>
        ← Back to my courses
      </button>
      <section className="sa-card" aria-labelledby="detail-h">
        <div className="sa-card-heading">
          <div>
            <h3 id="detail-h">{c.course_code}</h3>
            <p>{c.course_title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-1) var(--sp-3)", fontSize: "var(--fs-xs)", color: "var(--ds-muted)", marginTop: "var(--sp-2)" }}>
              <span>Section {c.section}</span>
              <span>·</span>
              <span>{c.teacher || "Instructor not assigned"}</span>
              <span>·</span>
              <span>{c.room || "Room TBA"}</span>
              <span>·</span>
              <span>{c.semester_name} · {c.academic_year}</span>
            </div>
            {c.credit_hours && (
              <p className="sa-st-note" style={{ marginTop: "var(--sp-3)" }}>
                {c.credit_hours} credit hour{c.credit_hours === 1 ? "" : "s"} · Status:{" "}
                <span className={`sa-badge ${statusTone(c.status)}`}>{c.status}</span>
              </p>
            )}
          </div>
          <div className="sa-stat-wrap">
            {summary ? (
              <>
                <div className="sa-stat-item">
                  <span className="sa-stat-label">Course percent</span>
                  <strong className="sa-stat-value">{formatPercent(summary.percent)}</strong>
                </div>
                <div className="sa-stat-item">
                  <span className="sa-stat-label">Grade</span>
                  <strong className="sa-stat-value" style={{ color: "var(--ds-terracotta-dark)" }}>
                    {summary.letter_grade || "—"}
                  </strong>
                </div>
                <div className="sa-stat-item">
                  <span className="sa-stat-label">Grade point</span>
                  <strong className="sa-stat-value">{summary.grade_point != null ? summary.grade_point.toFixed(2) : "—"}</strong>
                </div>
                <div className="sa-stat-item">
                  <span className="sa-stat-label">Assessments</span>
                  <strong className="sa-stat-value">{summary.assessments_count}</strong>
                </div>
              </>
            ) : (
              <p className="sa-st-empty">No published grades for this course yet.</p>
            )}
          </div>
        </div>

        {/* timetable + grades side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)", marginTop: "var(--sp-4)" }}>
          <section className="sa-card" aria-labelledby="tt-h">
            <div className="sa-card-heading">
              <div><h3 id="tt-h">Class schedule</h3><p>Weekly timetable for this course.</p></div>
            </div>
            {timetable.length === 0 ? (
              <p className="sa-st-empty">No timetable entries for this course.</p>
            ) : (
              <table className="sa-table sa-st-restable" role="region" aria-label="Timetable entries">
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Time</th>
                    <th scope="col">Room</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((slot) => (
                    <tr key={slot.id}>
                      <td data-label="Day">{slot.weekday_label}</td>
                      <td data-label="Time">{formatTimeRange(slot.starts_at, slot.ends_at)}</td>
                      <td data-label="Room">{slot.room || "TBA"}</td>
                      <td data-label="Status">
                        <span className={`sa-badge ${statusTone(slot.status)}`}>{slot.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="sa-card" aria-labelledby="grades-h">
            <div className="sa-card-heading">
              <div><h3 id="grades-h">Grades</h3><p>Published results for this course.</p></div>
            </div>
            {grades.length === 0 ? (
              <p className="sa-st-empty">No grades have been published yet.</p>
            ) : (
              <table className="sa-table sa-st-restable" role="region" aria-label="Course grades">
                <thead>
                  <tr>
                    <th scope="col">Assessment</th>
                    <th scope="col">Type</th>
                    <th scope="col">Score</th>
                    <th scope="col">Grade</th>
                    <th scope="col">Published</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.grade_id}>
                      <td data-label="Assessment">{g.title}</td>
                      <td data-label="Type">{assessmentTypeLabel(g.type)}</td>
                      <td data-label="Score">
                        <b>{g.score}</b><span className="sa-st-max"> / {g.max_score}</span>
                      </td>
                      <td data-label="Grade">
                        <span className={`sa-badge ${gradeTone(g.letter_grade)} ${letterGradeClass(g.letter_grade)}`}>
                          {g.letter_grade || "—"}
                        </span>
                      </td>
                      <td data-label="Published">{formatShortDate(g.graded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </section>
    </>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [detail, setDetail] = useState<StudentCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadCourses = async () => {
      try {
        const data = await apiRequest<StudentCoursesResponse>("/dashboard/student/courses");
        if (active) {
          setCourses(data.courses ?? []);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your courses.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCourses();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      if (!detail) return;
      try {
        const data = await apiRequest<StudentCourseDetail>(`/dashboard/student/courses/${detail.course.offering_id}`);
        if (active) setDetail(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load course details.");
      }
    };
    loadDetail();
    return () => { active = false; };
  }, [detail]);

  const openCourse = (course: StudentCourse) => {
    setDetail({ course, timetable: [], grades: [], summary: null } as StudentCourseDetail);
    setError(null);
  };

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>;

  return (
    <>
      {detail ? <CourseDetail course={detail} onBack={() => setDetail(null)} /> : <CoursesList courses={courses} onOpen={openCourse} />}
    </>
  );
}
