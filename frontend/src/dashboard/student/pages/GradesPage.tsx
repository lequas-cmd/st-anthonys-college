import React, { useEffect, useState } from "react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import {
  StudentGradesResponse,
  StudentAssessment,
  assessmentTypeLabel,
  formatDate,
  formatPercent,
  formatShortDate,
  gradeTone,
  letterGradeClass,
} from "../utils/studentPortal";

type Props = {
  studentId: number;
  studentName: string;
};

/** Collapse a table into labelled rows on small screens (reuses .sa-st-restable). */
function GradesCard({ course }: { course: NonNullable<StudentGradesResponse["courses"]>[number] }) {
  const pass = course.percent != null ? course.percent >= 60 : null;
  return (
    <section className="sa-panel sa-st-flush" aria-labelledby={`grades-${course.offering_id}`}>
      <div className="sa-panel-heading sa-st-padded">
        <div>
          <h3 id={`grades-${course.offering_id}`}>{course.course_code}</h3>
          <p>{course.course_title}</p>
          <div className="sa-st-meta-wrap">
            <span>Section {course.section}</span>
            <span>·</span>
            <span>{course.teacher || "Instructor TBA"}</span>
            <span>·</span>
            <span>{course.semester_name} · {course.academic_year}</span>
          </div>
        </div>
        <div className="sa-st-kpi-wrap">
          {course.percent != null ? (
            <>
              <div className="sa-stat-card">
                <span className="sa-st-cap">Course percent</span>
                <strong>{formatPercent(course.percent)}</strong>
              </div>
              <div className="sa-stat-card">
                <span className="sa-st-cap">Grade</span>
                <strong className={letterGradeClass(course.letter_grade)}>
                  {course.letter_grade || "—"}
                </strong>
              </div>
              <div className="sa-stat-card">
                <span className="sa-st-cap">Grade point</span>
                <strong>{course.grade_point != null ? course.grade_point.toFixed(2) : "—"}</strong>
              </div>
              <div className="sa-stat-card">
                <span className="sa-st-cap">Credit hours</span>
                <strong>{course.credit_hours}</strong>
              </div>
            </>
          ) : (
            <p className="sa-st-empty">No published grades yet.</p>
          )}
        </div>
      </div>

      {course.assessments.length === 0 ? (
        <p className="sa-st-empty">No published assessments for this course.</p>
      ) : (
        <table className="sa-table sa-st-restable" role="region" aria-label={`Grades for ${course.course_code}`}>
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

      {course.percent != null && (
        <p className="sa-st-footnote sa-st-padded">
          Course percent uses assessment weights where defined; otherwise raw marks. Pass mark 60%.
          {pass ? "" : " Below pass mark."}
        </p>
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
      <section className="sa-panel sa-st-flush" aria-labelledby="overview-h">
        <div className="sa-panel-heading sa-st-padded">
          <div>
            <h3 id="overview-h">Grades overview</h3>
            <p>Only results submitted by your instructor and published by the college.</p>
          </div>
        </div>
        <div className="sa-stat-grid">
          <div className="sa-stat-card">
            <span className="sa-st-cap">Courses with results</span>
            <strong>{courses.filter((c) => c.percent != null).length}</strong>
            <p>of {courses.length} enrolled</p>
          </div>
          {cumulativeGpa ? (
            <div className="sa-stat-card">
              <span className="sa-st-cap">Cumulative GPA</span>
              <strong>{cumulativeGpa}</strong>
              <p>{gpaCount} course{gpaCount === 1 ? "" : "s"} counted</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="sa-panel sa-st-flush" aria-labelledby="courses-h">
        <div className="sa-panel-heading sa-st-padded">
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
