import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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
  const pass = course.percent != null ? course.percent >= 60 : null;
  return (
    <article
      className="sa-panel sa-st-flush"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(course); }}
      onClick={() => onOpen(course)}
      style={{ cursor: "pointer" }}
    >
      <div className="sa-panel-heading sa-st-padded">
        <div>
          <h3>{course.course_code}</h3>
          <p>{course.course_title}</p>
          <div className="sa-st-meta-wrap">
            <span>Section {course.section}</span>
            <span>·</span>
            <span>{course.teacher || "Instructor TBA"}</span>
            <span>·</span>
            <span>{course.room || "Room TBA"}</span>
          </div>
        </div>
        <div className="sa-st-kpi-wrap">
          <span className={`sa-badge ${statusTone(course.status)}`}>{course.status}</span>
          {course.percent != null ? (
            <div>
              <strong>{formatPercent(course.percent)}</strong>
              <span className={`sa-badge ${gradeTone(course.letter_grade ?? "")}`}>{course.letter_grade}</span>
            </div>
          ) : null}
        </div>
      </div>
      <footer className="sa-st-card-footer">
        <button type="button" className="sa-link-button" onClick={(e) => { e.stopPropagation(); onOpen(course); }}>
          View course <ChevronRight size={14} />
        </button>
      </footer>
    </article>
  );
}

/* ---------- course list ---------- */
function CoursesList({ courses, onOpen }: { courses: StudentCourse[]; onOpen: (c: StudentCourse) => void }) {
  if (courses.length === 0) {
    return (
      <section className="sa-panel sa-st-flush" aria-labelledby="courses-h">
        <div className="sa-panel-heading sa-st-padded">
          <div><h3 id="courses-h">My courses</h3><p>Registrar-enrolled classes this college year.</p></div>
        </div>
        <p className="sa-st-empty">You are not currently enrolled in any courses.</p>
      </section>
    );
  }
  return (
    <section className="sa-panel sa-st-flush" aria-labelledby="courses-h">
      <div className="sa-panel-heading sa-st-padded">
        <div><h3 id="courses-h">My courses</h3><p>Registrar-enrolled classes this college year.</p></div>
      </div>
      <div className="sa-st-grid2">
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
      <section className="sa-panel sa-st-flush" aria-labelledby="detail-h">
        <div className="sa-panel-heading sa-st-padded">
          <div>
            <h3 id="detail-h">{c.course_code}</h3>
            <p>{c.course_title}</p>
            <div className="sa-st-meta-wrap">
              <span>Section {c.section}</span>
              <span>·</span>
              <span>{c.teacher || "Instructor not assigned"}</span>
              <span>·</span>
              <span>{c.room || "Room TBA"}</span>
              <span>·</span>
              <span>{c.semester_name} · {c.academic_year}</span>
            </div>
            {c.credit_hours && (
              <p className="sa-st-footnote">
                {c.credit_hours} credit hour{c.credit_hours === 1 ? "" : "s"} · Status:{" "}
                <span className={`sa-badge ${statusTone(c.status)}`}>{c.status}</span>
              </p>
            )}
          </div>
          <div className="sa-st-kpi-wrap">
            {summary ? (
              <>
                <div className="sa-stat-card">
                  <span className="sa-st-cap">Course percent</span>
                  <strong>{formatPercent(summary.percent)}</strong>
                </div>
                <div className="sa-stat-card">
                  <span className="sa-st-cap">Grade</span>
                  <strong className={letterGradeClass(summary.letter_grade)}>
                    {summary.letter_grade || "—"}
                  </strong>
                </div>
                <div className="sa-stat-card">
                  <span className="sa-st-cap">Grade point</span>
                  <strong>{summary.grade_point != null ? summary.grade_point.toFixed(2) : "—"}</strong>
                </div>
              </>
            ) : (
              <p className="sa-st-empty">No published grades for this course yet.</p>
            )}
          </div>
        </div>

        {/* timetable */}
        <div className="sa-st-grid2">
          <section className="sa-panel" aria-labelledby="tt-h">
            <div className="sa-panel-heading sa-st-padded">
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

          <section className="sa-panel sa-st-flush" aria-labelledby="grades-h">
            <div className="sa-panel-heading sa-st-padded">
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
