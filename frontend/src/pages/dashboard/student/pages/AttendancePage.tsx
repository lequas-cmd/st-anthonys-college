import React, { useEffect, useState } from "react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import {
  StudentAttendanceResponse,
  formatDate,
  formatPercent,
  attendanceTone,
} from "../utils/studentPortal";

type Props = {
  studentId: number;
  studentName: string;
};

export default function AttendancePage({ studentId, studentName }: Props) {
  const [data, setData] = useState<StudentAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadAttendance = async () => {
      try {
        const payload = await apiRequest<StudentAttendanceResponse>("/dashboard/student/attendance");
        if (active) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your attendance.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAttendance();
    return () => { active = false; };
  }, []);

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>;
  if (!data) return null;

  const { overall, by_class, sessions, threshold } = data;
  const pct = overall.percentage;

  return (
    <>
      <section className="sa-card" aria-labelledby="overview-h">
        <div className="sa-card-heading">
          <div>
            <h3 id="overview-h">Attendance</h3>
            <p>
              Excused sessions are shown separately and do not count against your rate. Minimum: {threshold}%
            </p>
          </div>
        </div>

        <div className="sa-stat-wrap">
          <div className="sa-stat-item">
            <span className="sa-stat-label">Overall rate</span>
            <strong className="sa-stat-value">{formatPercent(pct)}</strong>
          </div>
          <div className="sa-stat-item">
            <span className="sa-stat-label">Present</span>
            <strong className="sa-stat-value">{overall.present}</strong>
          </div>
          <div className="sa-stat-item">
            <span className="sa-stat-label">Late</span>
            <strong className="sa-stat-value">{overall.late}</strong>
          </div>
          <div className="sa-stat-item">
            <span className="sa-stat-label">Absent</span>
            <strong className="sa-stat-value">{overall.absent}</strong>
          </div>
          {overall.excused > 0 && (
            <div className="sa-stat-item">
              <span className="sa-stat-label">Excused</span>
              <strong className="sa-stat-value">{overall.excused}</strong>
            </div>
          )}
        </div>

        {pct != null && pct < threshold && (
          <p className="sa-st-note">
            <b>Attendance warning:</b> your rate is below the {threshold}% minimum. Contact your instructor or the
            registrar's office.
          </p>
        )}

        <div style={{ marginTop: "var(--sp-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--ds-muted)" }}>Attendance progress</span>
            <div style={{ flex: 1, height: 8, background: "var(--ds-cream-2)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: Math.min(100, Math.max(0, pct ?? 0)) + "%",
                  background: pct != null && pct < threshold ? "var(--ds-warn)" : "var(--ds-good)",
                  borderRadius: "var(--r-pill)",
                  transition: "width 600ms var(--ds-ease)",
                }}
              />
            </div>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--ds-ink)", minWidth: "40px", textAlign: "right" }}>
              {formatPercent(pct)}
            </span>
          </div>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--ds-muted)", margin: 0 }}>
            {overall.present + overall.late} of {overall.total_sessions} sessions attended
          </p>
        </div>
      </section>

      <section className="sa-card" aria-labelledby="byclass-h">
        <div className="sa-card-heading">
          <div><h3 id="byclass-h">Attendance by course</h3><p>Sessions you missed, per enrolled class.</p></div>
        </div>
        {by_class.length === 0 ? (
          <p className="sa-st-empty">No attendance has been recorded for your courses yet.</p>
        ) : (
          <table className="sa-table sa-st-restable" role="region" aria-label="Attendance by course">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Present</th>
                <th scope="col">Late</th>
                <th scope="col">Absent</th>
                <th scope="col">Excused</th>
                <th scope="col">Rate</th>
                <th scope="col">Standing</th>
              </tr>
            </thead>
            <tbody>
              {by_class.map((row) => (
                <tr key={row.offering_id}>
                  <td data-label="Course">
                    <strong>{row.course_code}</strong>
                    <small className="sa-st-block">{row.course_title}</small>
                  </td>
                  <td data-label="Present">{row.present}</td>
                  <td data-label="Late">{row.late}</td>
                  <td data-label="Absent">{row.absent}</td>
                  <td data-label="Excused">{row.excused}</td>
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
        )}
      </section>

      <section className="sa-card" aria-labelledby="sessions-h">
        <div className="sa-card-heading">
          <div><h3 id="sessions-h">Recent sessions</h3><p>Most recent first.</p></div>
        </div>
        {sessions.length === 0 ? (
          <p className="sa-st-empty">No attendance sessions recorded yet.</p>
        ) : (
          <table className="sa-table sa-st-restable" role="region" aria-label="Recent attendance sessions">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Date</th>
                <th scope="col">Topic</th>
                <th scope="col">Status</th>
                <th scope="col">Recorded</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={`${s.course_code}-${s.session_date}`}>
                  <td data-label="Course">
                    <strong>{s.course_code}</strong>
                    <small className="sa-st-block">{s.section}</small>
                  </td>
                  <td data-label="Date">{formatDate(s.session_date)}</td>
                  <td data-label="Topic">{s.topic || "—"}</td>
                  <td data-label="Status">
                    <span className={`sa-badge ${attendanceTone(s.status)}`}>{s.status}</span>
                  </td>
                  <td data-label="Recorded">{formatDate(s.recorded_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
