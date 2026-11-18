import React, { useEffect, useState } from "react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import {
  StudentTranscriptResponse,
  TranscriptTerm,
  formatDate,
  formatGpa,
  formatPercent,
  letterGradeClass,
} from "../utils/studentPortal";

type Props = {
  studentId: number;
  studentName: string;
};

export default function TranscriptPage({ studentId, studentName }: Props) {
  const [data, setData] = useState<StudentTranscriptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadTranscript = async () => {
      try {
        const payload = await apiRequest<StudentTranscriptResponse>("/dashboard/student/transcript");
        if (active) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your transcript.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTranscript();
    return () => { active = false; };
  }, []);

  const printTranscript = () => {
    window.print();
  };

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>;
  if (!data) return null;

  const { student, terms, cumulative_gpa, cumulative_credits } = data;
  const totalCourses = terms.reduce((sum, t) => sum + t.courses.length, 0);
  const gradedCourses = terms.reduce(
    (sum, t) => sum + t.courses.filter((c) => c.percent != null).length,
    0,
  );

  return (
    <>
      <section className="sa-panel sa-st-flush" aria-labelledby="overview-h">
        <div className="sa-panel-heading sa-st-padded">
          <div>
            <h3 id="overview-h">Official transcript</h3>
            <p>
              Published terms only. Print or save as PDF using your browser’s print dialog.
            </p>
          </div>
          <div className="sa-st-actions-wrap">
            <button type="button" className="sa-button sa-button-outline" onClick={printTranscript}>
              Print / Save as PDF
            </button>
          </div>
        </div>

        <div className="sa-st-grid2">
          <div className="sa-stat-card">
            <span className="sa-st-cap">Student</span>
            <strong>{student.first_name} {student.last_name}</strong>
            <p>{student.student_number}</p>
          </div>
          <div className="sa-stat-card">
            <span className="sa-st-cap">Program</span>
            <strong>{student.program}</strong>
            <p>{student.department || "Department not assigned"}</p>
          </div>
          <div className="sa-stat-card">
            <span className="sa-st-cap">Cumulative GPA</span>
            <strong>{cumulative_gpa != null ? cumulative_gpa.toFixed(2) : "—"}</strong>
            <p>{cumulative_credits} credit hours</p>
          </div>
        </div>

        <p className="sa-st-footnote">
          {totalCourses} course{totalCourses === 1 ? "" : "s"} recorded · {gradedCourses} with published results.
          Terms are shown only after the college publishes results for that term.
        </p>
      </section>

      <section className="sa-panel sa-st-flush" aria-labelledby="terms-h">
        <div className="sa-panel-heading sa-st-padded">
          <div><h3 id="terms-h">Published terms</h3><p>Official record of published results.</p></div>
        </div>

        {terms.length === 0 ? (
          <p className="sa-st-empty">No terms have been published yet.</p>
        ) : (
          <div className="sa-st-stack">
            {terms.map((term) => (
              <article key={term.id} className="sa-panel sa-st-flush sa-st-term">
                <div className="sa-panel-heading sa-st-padded sa-st-termhead">
                  <div>
                    <h4>{term.name} · {term.academic_year}</h4>
                    <p>
                      {formatDate(term.starts_on)} – {formatDate(term.ends_on)}
                      {term.is_current ? " · Current term" : ""}
                    </p>
                    <p className="sa-st-meta">
                      Published {formatDate(term.published_at)}
                    </p>
                  </div>
                  <div className="sa-stat-card sa-st-termgpa">
                    <span className="sa-st-cap">Term GPA</span>
                    <strong>{formatGpa(term.gpa)}</strong>
                  </div>
                </div>

                {term.courses.length === 0 ? (
                  <p className="sa-st-empty">No courses with published results this term.</p>
                ) : (
                  <table className="sa-table sa-st-restable" role="region" aria-label={`Results for ${term.name}`}>
                    <thead>
                      <tr>
                        <th scope="col">Course</th>
                        <th scope="col">Credit hours</th>
                        <th scope="col">Percent</th>
                        <th scope="col">Grade</th>
                        <th scope="col">Pass</th>
                      </tr>
                    </thead>
                    <tbody>
                      {term.courses.map((course) => (
                        <tr key={`${term.id}-${course.course_code}`}>
                          <td data-label="Course">
                            <strong>{course.course_code}</strong>
                            <small className="sa-st-block">{course.course_title}</small>
                          </td>
                          <td data-label="Credit hours">{course.credit_hours}</td>
                          <td data-label="Percent">
                            {formatPercent(course.percent)}
                          </td>
                          <td data-label="Grade">
                            <span
                              className={`sa-badge ${course.is_pass ? "success" : "warning"} ${letterGradeClass(course.letter_grade)}`}
                            >
                              {course.letter_grade || "—"}
                            </span>
                          </td>
                          <td data-label="Pass">
                            {course.is_pass ? <span className="sa-badge success">Yes</span> : <span className="sa-badge warning">No</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {cumulative_gpa != null && (
        <section className="sa-panel sa-st-flush" aria-labelledby="cumulative-h">
          <div className="sa-panel-heading sa-st-padded">
            <div><h3 id="cumulative-h">Cumulative record</h3><p>All published terms combined.</p></div>
          </div>
          <div className="sa-stat-grid">
            <div className="sa-stat-card">
              <span className="sa-st-cap">Cumulative GPA</span>
              <strong>{cumulative_gpa.toFixed(2)}</strong>
              <p>{cumulative_credits} credit hour{cumulative_credits === 1 ? "" : "s"} recorded</p>
            </div>
          </div>
          <p className="sa-st-footnote sa-st-padded">
            This transcript includes published terms only. Unpublished terms are not shown. To request a correction or
            an official sealed copy, contact the registrar’s office.
          </p>
        </section>
      )}

      <style>
        {`
          @media print {
            .sa-sidebar, .sa-topbar, .sa-st-actions-wrap, .sa-button, .sa-link-button {
              display: none !important;
            }
            .sa-panel { border: 0; box-shadow: none; }
            .sa-st-restable td::before { content: none !important; }
            .sa-st-restable td { display: table-cell !important; padding: 0.5rem 0.75rem; }
          }
        `}
      </style>
    </>
  );
}
