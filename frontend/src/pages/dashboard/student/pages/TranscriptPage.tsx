import React, { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import {
  StudentTranscriptResponse,
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
      <section className="sa-card sa-card-hover" aria-labelledby="overview-h">
        <div className="sa-card-heading">
          <div>
            <h3 id="overview-h">Official transcript</h3>
            <p>
              Published terms only. Print or save as PDF using your browser's print dialog.
            </p>
          </div>
          <div className="sa-heading-actions">
            <button type="button" className="sa-button sa-button-outline" onClick={printTranscript}>
              <Printer size={16} /> Print / Save as PDF
            </button>
          </div>
        </div>

        <div className="sa-transcript-doc" id="transcript-print">
          <div className="sa-transcript-header">
            <div className="college">
              <div className="college-strong">Saint Anthony's</div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--ds-muted)" }}>Technical & Vocational College</div>
            </div>
            <div className="doc-title">Official Transcript</div>
          </div>

          <div className="sa-transcript-student">
            <div className="item">
              <span className="label">Student</span>
              <span className="value">{student.first_name} {student.last_name}</span>
            </div>
            <div className="item">
              <span className="label">Student ID</span>
              <span className="value">{student.student_number}</span>
            </div>
            <div className="item">
              <span className="label">Program</span>
              <span className="value">{student.program}</span>
            </div>
          </div>

          {terms.map((term) => (
            <section key={term.id} className="sa-transcript-term">
              <div className="sa-transcript-term-head">
                <div className="term-info">
                  <h4>{term.name} · {term.academic_year}</h4>
                  <p>
                    {formatDate(term.starts_on)} – {formatDate(term.ends_on)}
                    {term.is_current ? " · Current term" : ""}
                  </p>
                  <p className="sa-st-meta">Published {formatDate(term.published_at)}</p>
                </div>
                <div className="sa-transcript-term-gpa">
                  <span className="label">Term GPA</span>
                  <span className="value">{formatGpa(term.gpa)}</span>
                </div>
              </div>

              <table className="sa-transcript-table">
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
            </section>
          ))}

          <div className="sa-transcript-summary">
            <div className="summary-grid">
              <div className="item">
                <span className="label">Total courses</span>
                <span className="value">{totalCourses}</span>
              </div>
              <div className="item">
                <span className="label">Published results</span>
                <span className="value">{gradedCourses}</span>
              </div>
              <div className="item">
                <span className="label">Cumulative GPA</span>
                <span className="value">{cumulative_gpa != null ? cumulative_gpa.toFixed(2) : "—"}</span>
              </div>
              <div className="item">
                <span className="label">Credit hours</span>
                <span className="value">{cumulative_credits}</span>
              </div>
            </div>
            <p className="sa-st-note" style={{ marginTop: "var(--sp-4)", marginBottom: 0 }}>
              This transcript includes published terms only. Unpublished terms are not shown. To request a correction or
              an official sealed copy, contact the registrar's office.
            </p>
          </div>
        </div>

        <p className="sa-st-footnote">
          {totalCourses} course{totalCourses === 1 ? "" : "s"} recorded · {gradedCourses} with published results.
          Terms are shown only after the college publishes results for that term.
        </p>
      </section>

      <style>
        {`
          @media print {
            .sa-sidebar, .sa-topbar, .sa-alert-panel, .sa-button, .sa-link-button,
            .sa-heading-actions, .sa-st-footnote {
              display: none !important;
            }
            .sa-dashboard { background: #fff !important; color: #000 !important; }
            .sa-content { max-width: none !important; width: 100% !important; padding: 0 !important; }
            .sa-card { border-radius: 0 !important; border-color: #bbb !important; break-inside: avoid; box-shadow: none !important; }
            .sa-transcript-doc { box-shadow: none !important; border: none !important; }
            .sa-st-restable td::before { content: none !important; }
            .sa-st-restable td { display: table-cell !important; padding: 0.5rem 0.75rem; }
          }
        `}
      </style>
    </>
  );
}
