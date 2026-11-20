import React, { useEffect, useState } from "react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import {
  StudentGradesResponse,
  assessmentTypeLabel,
  formatPercent,
  formatShortDate,
  gradeTone,
  letterGradeClass,
} from "../utils/studentPortal";

type Props = {
  studentId: number;
  studentName: string;
};

/** Course grade card with progress bar and assessment list. */
function GradesCard({ course }: { course: NonNullable<StudentGradesResponse["courses"]>[number] }) {
  const pass = course.percent != null ? course.percent >= 60 : null;
  const pct = course.percent ?? 0;

  return (
    <section className="sa-card sa-card-hover" aria-labelledby={`grades-${course.offering_id}`}>
      <div className="sa-card-heading">
        <div>
          <h3 id={`grades-${course.offering_id}`}>{course.course_code}</h3>
          <p>{course.course_title}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-1) var(--sp-3)", fontSize: "var(--fs-xs)", color: "var(--ds-muted)", marginTop: "var(--sp-2)" }}>
            <span>Section {course.section}</span>
            <span>·</span>
            <span>{course.teacher || "Instructor TBA"}</span>
            <span>·</span>
            <span>{course.semester_name} · {course.academic_year}</span>
          </div>
        </div>
        <div className="sa-stat-wrap">
          {course.percent != null ? (
            <>
              <div className="sa-stat-item">
                <span className="sa-stat-label">Course percent</span>
                <strong className="sa-stat-value">{formatPercent(course.percent)}</strong>
              </div>
              <div className="sa-stat-item">
                <span className="sa-stat-label">Grade</span>
                <strong className="sa-stat-value" style={{ color: "var(--ds-terracotta-dark)" }}>
                  {course.letter_grade || "—"}
                </strong>
              </div>
              <div className="sa-stat-item">
                <span className="sa-stat-label">Grade point</span>
                <strong className="sa-stat-value">{course.grade_point != null ? course.grade_point.toFixed(2) : "—"}</strong>
              </div>
              <div className="sa-stat-item">
                <span className="sa-stat-label">Credit hours</span>
                <strong className="sa-stat-value">{course.credit_hours}</strong>
              </div>
            </>
          ) : (
            <p className="sa-st-empty">No published grades yet.</p>
          )}
        </div>
      </div>

      {course.percent != null && (
        <div style={{ marginTop: "var(--sp-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--ds-muted)" }}>Progress</span>
            <div style={{ flex: 1, height: 8, background: "var(--ds-cream-2)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: Math.min(100, Math.max(0, pct)) + "%",
                  background: pass ? "var(--ds-good)" : "var(--ds-warn)",
                  borderRadius: "var(--r-pill)",
                  transition: "width 600ms var(--ds-ease)",
                }}
              />
            </div>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--ds-ink)", minWidth: "40px", textAlign: "right" }}>{formatPercent(course.percent)}</span>
          </div>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--ds-muted)", margin: 0 }}>
            Course percent uses assessment weights where defined; otherwise raw marks. Pass mark 60%.
            {pass ? "" : " Below pass mark."}
          </p>
        </div>
      )}

      {course.assessments.length === 0 ? (
        <p className="sa-st-empty" style={{ marginTop: "var(--sp-4)" }}>No published assessments for this course.</p>
      ) : (
        <table className="sa-table sa-st-restable" role="region" aria-label={`Grades for ${course.course_code}`} style={{ marginTop: "var(--sp-4)" }}>
          <thead>
            <tr>
              <th scope="col">Assessment</th>
              <th scope="col">Type</th>
              <th scope="col">Weight</th>
              <th scope="col">Score</th>
              <th scope="col">Grade</th>
              <th scope="col">Due</th>
              <th scope="col">Graded</th>
            </tr>
          </thead>
          <tbody>
            {course.assessments.map((g) => (
              <tr key={g.grade_id}>
                <td data-label="Assessment">
                  <strong>{g.title}</strong>
                  <small className="sa-st-block">{g.due_date ? `Due ${formatShortDate(g.due_date)}` : "No due date"}</small>
                </td>
                <td data-label="Type">{assessmentTypeLabel(g.type)}</td>
                <td data-label="Weight">{g.weight_percent > 0 ? `${g.weight_percent}%` : "—"}</td>
                <td data-label="Score">
                  <b>{g.score}</b><span className="sa-st-max"> / {g.max_score}</span>
                </td>
                <td data-label="Grade">
                  <span className={`sa-badge ${gradeTone(g.letter_grade)} ${letterGradeClass(g.letter_grade)}`}>
                    {g.letter_grade || "—"}
                  </span>
                </td>
                <td data-label="Due">{g.due_date ? formatShortDate(g.due_date) : "—"}</td>
                <td data-label="Graded">{formatShortDate(g.graded_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function GradesPage({ studentId, studentName }: Props) {
  const [courses, setCourses] = useState<NonNullable<StudentGradesResponse["courses"]>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadGrades = async () => {
      try {
        const data = await apiRequest<StudentGradesResponse>("/dashboard/student/grades");
        if (active) {
          setCourses(data.courses ?? []);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your grades.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadGrades();
    return () => { active = false; };
  }, []);

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>;

  const gpa = courses.reduce((sum, c) => sum + (c.grade_point ?? 0), 0);
  const gpaCount = courses.filter((c) => c.grade_point != null).length;
  const cumulativeGpa = gpaCount ? (gpa / gpaCount).toFixed(2) : null;

  return (
    <>
      <section className="sa-card" aria-labelledby="overview-h">
        <div className="sa-card-heading">
          <div>
            <h3 id="overview-h">Grades overview</h3>
            <p>Only results submitted by your instructor and published by the college.</p>
          </div>
        </div>
        <div className="sa-stat-grid">
          <div className="sa-stat-card">
            <div className="sa-stat-top"><span>Courses with results</span></div>
            <strong>{courses.filter((c) => c.percent != null).length}</strong>
            <p>of {courses.length} enrolled</p>
          </div>
          {cumulativeGpa ? (
            <div className="sa-stat-card">
              <div className="sa-stat-top"><span>Cumulative GPA</span></div>
              <strong>{cumulativeGpa}</strong>
              <p>{gpaCount} course{gpaCount === 1 ? "" : "s"} counted</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="sa-card" aria-labelledby="courses-h">
        <div className="sa-card-heading">
          <div><h3 id="courses-h">Results by course</h3><p>Assessment marks, totals and letter grades.</p></div>
        </div>
        {courses.length === 0 ? (
          <p className="sa-st-empty">You are not enrolled in any courses with published results.</p>
        ) : (
          <div className="sa-st-stack">
            {courses.map((course) => (
              <GradesCard key={course.offering_id} course={course} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
