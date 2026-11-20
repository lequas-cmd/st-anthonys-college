import React, { useEffect, useState } from "react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import { StudentExam, formatDate, formatTimeRange, statusTone, assessmentTypeLabel } from "../utils/studentPortal";

type Props = {
  studentId: number;
  studentName: string;
};

export default function ExamsPage({ studentId, studentName }: Props) {
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadExams = async () => {
      try {
        const data = await apiRequest<{ exams: StudentExam[]; upcoming: StudentExam[] }>("/dashboard/student/exams");
        if (active) {
          setExams(data.exams ?? []);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your exams.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadExams();
    return () => { active = false; };
  }, []);

  const upcoming = exams.filter((e) => e.status === "scheduled");
  const postponed = exams.filter((e) => e.status === "postponed");

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>;

  return (
    <>
      <section className="sa-card" aria-labelledby="overview-h">
        <div className="sa-card-heading">
          <div>
            <h3 id="overview-h">Exams</h3>
            <p>Scheduled by the registrar. Upcoming exams are listed first.</p>
          </div>
        </div>

        {exams.length === 0 ? (
          <p className="sa-st-empty">No exams have been scheduled for your courses yet.</p>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginTop: "var(--sp-4)" }}>
                {upcoming.map((exam) => (
                  <div key={exam.id} className="sa-exam-card">
                    <div className="exam-info">
                      <div className="exam-head">
                        <span className="exam-code">{exam.course_code}</span>
                        <span className="exam-title">{exam.assessment_title}</span>
                      </div>
                      <div className="exam-meta">
                        {formatDate(exam.exam_date)} · {formatTimeRange(exam.starts_at, exam.ends_at)} ·
                        {assessmentTypeLabel(exam.assessment_type)} · Max score {exam.max_score} ·
                        {exam.room || "Room TBA"}
                      </div>
                    </div>
                    <span className={`sa-badge ${statusTone(exam.status)}`}>{exam.status}</span>
                  </div>
                ))}
              </div>
            )}
            {postponed.length > 0 && (
              <section className="sa-card" aria-labelledby="postponed-h" style={{ marginTop: "var(--sp-4)" }}>
                <div className="sa-card-heading">
                  <div><h3 id="postponed-h">Postponed</h3><p>Exams rescheduled by the college.</p></div>
                </div>
                <table className="sa-table sa-st-restable" role="region" aria-label="Postponed exams">
                  <thead>
                    <tr>
                      <th scope="col">Course</th>
                      <th scope="col">Assessment</th>
                      <th scope="col">Date</th>
                      <th scope="col">Time</th>
                      <th scope="col">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postponed.map((exam) => (
                      <tr key={exam.id}>
                        <td data-label="Course">{exam.course_code}</td>
                        <td data-label="Assessment">{exam.assessment_title}</td>
                        <td data-label="Date">{formatDate(exam.exam_date)}</td>
                        <td data-label="Time">{formatTimeRange(exam.starts_at, exam.ends_at)}</td>
                        <td data-label="Room">{exam.room || "Room TBA"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}
      </section>

      <section className="sa-card" aria-labelledby="all-h">
        <div className="sa-card-heading">
          <div><h3 id="all-h">All scheduled exams</h3><p>{exams.length} exam{exams.length === 1 ? "" : "s"} found.</p></div>
        </div>
        {exams.length === 0 ? (
          <p className="sa-st-empty">No exams to display.</p>
        ) : (
          <table className="sa-table sa-st-restable" role="region" aria-label="All exams">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Course</th>
                <th scope="col">Assessment</th>
                <th scope="col">Time</th>
                <th scope="col">Room</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td data-label="Date">{formatDate(exam.exam_date)}</td>
                  <td data-label="Course">{exam.course_code}</td>
                  <td data-label="Assessment">{exam.assessment_title}</td>
                  <td data-label="Time">{formatTimeRange(exam.starts_at, exam.ends_at)}</td>
                  <td data-label="Room">{exam.room || "Room TBA"}</td>
                  <td data-label="Status">
                    <span className={`sa-badge ${statusTone(exam.status)}`}>{exam.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
