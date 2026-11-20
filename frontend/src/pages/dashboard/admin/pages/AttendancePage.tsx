import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable from "../components/AdminDataTable";
import AdminCrudModal from "../components/AdminCrudModal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

type Session = { id: number; offering_id: number; session_date: string; topic: string | null; course_code: string; course_title: string; section: string };

export default function AttendancePage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [, setRecords] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [report, setReport] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [threshold, setThreshold] = useState(75);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"entry" | "report" | "flags">("entry");

  const loadSessions = async () => {
    setLoading(true); setError(null);
    try {
      const [s, o] = await Promise.all([
        apiRequest<any>("/dashboard/admin/attendance/sessions"),
        apiRequest<any>("/dashboard/admin/offerings"),
      ]);
      setSessions(s.sessions || []);
      setOfferings(o.offerings || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSessions(); }, []);

  const openSession = async (id: number) => {
    setSelectedSession(id);
    const res = await apiRequest<any>(`/dashboard/admin/attendance/sessions/${id}/records`);
    setRecords(res.records || []);
    setRoster(res.roster || []);
    const m: Record<number, string> = {};
    for (const r of res.records || []) m[r.student_id] = r.status;
    for (const st of res.roster || []) if (!m[st.student_id]) m[st.student_id] = "present";
    setMarks(m);
  };

  const saveMarks = async () => {
    if (!selectedSession) return;
    const recs = Object.entries(marks).map(([sid, status]) => ({ student_id: Number(sid), status }));
    await apiRequest(`/dashboard/admin/attendance/sessions/${selectedSession}/records`, { method: "PUT", body: JSON.stringify({ records: recs }) });
    await openSession(selectedSession);
  };

  const loadReport = async () => {
    const res = await apiRequest<any>("/dashboard/admin/attendance/report");
    setReport(res.report || []);
  };

  const loadFlags = async () => {
    const res = await apiRequest<any>(`/dashboard/admin/attendance/low-flags?threshold=${threshold}`);
    setFlags(res.flags || []);
    setThreshold(res.threshold ?? threshold);
  };

  useEffect(() => { if (tab === "report") loadReport(); if (tab === "flags") loadFlags(); }, [tab]);

  if (loading || parentLoading) return <LoadingState message="Loading attendance…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Attendance</h3><p>Per-class daily entry, reports, low-attendance flags</p></div>
        </div>
        <div className="sa-inline-actions">
          {(["entry", "report", "flags"] as const).map((t) => (
            <button key={t} type="button" className={`sa-button ${tab === t ? "sa-button-primary" : "sa-button-outline"}`} onClick={() => setTab(t)}>{t}</button>
          ))}
          <button type="button" className="sa-button sa-button-primary" onClick={() => setModalOpen(true)}>＋ New session</button>
        </div>
      </div>

      {tab === "entry" && (
        <div className="sa-st-grid2">
          <div className="sa-panel">
            <div className="sa-panel-heading"><h3>Sessions</h3></div>
            {sessions.length === 0 ? <EmptyState message="No sessions yet." /> : (
              <div className="sa-task-list">
                {sessions.map((s) => (
                  <div key={s.id} className="sa-task-row">
                    <div className="sa-task-dot" aria-hidden="true">◷</div>
                    <div className="sa-task-info">
                      <strong>{s.course_code} {s.course_title}</strong>
                      <span>{s.section} · {new Date(s.session_date).toLocaleDateString()}</span>
                      <small>{s.topic || "No topic"}</small>
                    </div>
                    <button type="button" className="sa-button sa-button-outline" onClick={() => openSession(s.id)}>Open</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="sa-panel">
            <div className="sa-panel-heading"><h3>Mark attendance</h3></div>
            {!selectedSession ? <p>Select a session.</p> : (
              <>
                <div className="sa-table-wrap">
                  <table className="sa-table sa-admin-table">
                    <thead><tr><th>Student</th><th>Status</th></tr></thead>
                    <tbody>
                      {roster.map((st) => (
                        <tr key={st.student_id}>
                          <td>{st.first_name} {st.last_name} <small>{st.student_number}</small></td>
                          <td>
                            <select className="sa-select" value={marks[st.student_id] || "present"} onChange={(e) => setMarks({ ...marks, [st.student_id]: e.target.value })}>
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="excused">Excused</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="sa-button sa-button-primary" onClick={saveMarks}>Save attendance</button>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "report" && (
        <div className="sa-panel">
          <div className="sa-panel-heading"><h3>Attendance report</h3></div>
          {report.length === 0 ? <EmptyState message="No data." /> : (
            <AdminDataTable rows={report} columns={[
              { key: "studentNumber", label: "Student", sortable: true },
              { key: "name", label: "Name" },
              { key: "courseCode", label: "Course" },
              { key: "totalSessions", label: "Sessions" },
              { key: "absent", label: "Absent" },
              { key: "attendanceRate", label: "Rate %", render: (r: any) => `${r.attendanceRate}%` },
            ]} emptyLabel="No records." getRowId={(r: any) => r.studentId} />
          )}
        </div>
      )}

      {tab === "flags" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <h3>Low-attendance flags</h3>
            <span>Threshold: {threshold}%</span>
          </div>
          {flags.length === 0 ? <EmptyState message="No low-attendance flags." /> : (
            <AdminDataTable rows={flags} columns={[
              { key: "studentNumber", label: "Student" },
              { key: "name", label: "Name" },
              { key: "courseCode", label: "Course" },
              { key: "attendanceRate", label: "Rate %", render: (r: any) => `${r.attendanceRate}%` },
            ]} emptyLabel="No flags." getRowId={(r: any) => r.studentId} />
          )}
        </div>
      )}

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title="New attendance session" submitLabel="Create" fields={[
          { name: "offering_id", label: "Offering ID", type: "number", required: true },
          { name: "session_date", label: "Date", type: "date", required: true },
          { name: "topic", label: "Topic" },
        ]} onClose={() => setModalOpen(false)} onSubmit={async (v) => {
          await apiRequest("/dashboard/admin/attendance/sessions", { method: "POST", body: JSON.stringify({ offering_id: Number(v.offering_id), session_date: v.session_date, topic: v.topic }) });
          setModalOpen(false); await loadSessions();
        }} />
      )}
    </div>
  );
}