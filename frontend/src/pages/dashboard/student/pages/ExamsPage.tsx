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
      <section className="sa-panel sa-st-flush" aria-labelledby="overview-h">
        <div className="sa-panel-heading sa-st-padded">
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
              <div className="sa-st-stack">
                {upcoming.map((exam) => (
                  <article key={exam.id} className="sa-panel sa-st-padded">
                    <div className="sa-st-examrow">
                      <div>
                        <h4>{exam.course_code} · {exam.assessment_title}</h4>
                        <p>{assessmentTypeLabel(exam.assessment_type)} · Max score {exam.max_score}</p>
                      </div>
                      <div className="sa-st-exammeta">
                        <span>{formatDate(exam.exam_date)}</span>
                        <span>{formatTimeRange(exam.starts_at, exam.ends_at)}</span>
                        <span>{exam.room || "Room TBA"}</span>
                      </div>
                    </div>
                    <span className={`sa-badge ${statusTone(exam.status)}`}>{exam.status}</span>
                  </article>
                ))}
              </div>
            )}
            {postponed.length > 0 && (
              <section className="sa-panel sa-st-padded" aria-labelledby="postponed-h">
                <div className="sa-panel-heading sa-st-padded">
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

      <section className="sa-panel sa-st-flush" aria-labelledby="all-h">
        <div className="sa-panel-heading sa-st-padded">
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
