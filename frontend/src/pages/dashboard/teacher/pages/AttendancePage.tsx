import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import { TeacherClass } from "../TeacherDashboard";
import AdminCrudModal from "../../admin/components/AdminCrudModal";
import LoadingState from "../../admin/components/LoadingState";
import ErrorState from "../../admin/components/ErrorState";
import EmptyState from "../../admin/components/EmptyState";

type Props = { data: any; loading: boolean; };

export default function AttendancePage({ data, loading: parentLoading }: Props) {
  const classes: TeacherClass[] = data?.classes ?? [];
  const [selectedClassId, setSelectedClassId] = useState<number | null>(classes[0]?.id ?? null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [, setSessionDate] = useState("");
  const [, setTopic] = useState("");

  useEffect(() => { if (classes.length && selectedClassId == null) setSelectedClassId(classes[0].id); }, [classes]);

  const loadSessions = async (classId: number) => {
    setLoading(true); setError(null);
    try {
      const res = await apiRequest<any>(`/dashboard/teacher/attendance/sessions?offering_id=${classId}`);
      setSessions(res.sessions || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedClassId) loadSessions(selectedClassId); }, [selectedClassId]);

  const openSession = async (id: number) => {
    setSelectedSession(id);
    const res = await apiRequest<any>(`/dashboard/admin/attendance/sessions/${id}/records`);
    setRoster(res.roster || []);
    const m: Record<number, string> = {};
    for (const r of res.records || []) m[r.student_id] = r.status;
    for (const st of res.roster || []) if (!m[st.student_id]) m[st.student_id] = "present";
    setMarks(m);
  };

  const save = async () => {
    if (!selectedSession) return;
    const recs = Object.entries(marks).map(([sid, status]) => ({ student_id: Number(sid), status }));
    await apiRequest(`/dashboard/teacher/attendance/sessions/${selectedSession}/records`, { method: "PUT", body: JSON.stringify({ records: recs }) });
    await openSession(selectedSession);
  };

  const createSession = async (date: string, topicVal: string) => {
    if (!selectedClassId || !date) return;
    const res = await apiRequest<any>(`/dashboard/teacher/classes/${selectedClassId}/attendance/sessions`, { method: "POST", body: JSON.stringify({ session_date: date, topic: topicVal }) });
    setModalOpen(false); setSessionDate(""); setTopic("");
    await loadSessions(selectedClassId);
    await openSession(res.sessionId);
  };

  if (parentLoading) return <LoadingState message="Loading attendance…" />;
  if (loading) return <LoadingState message="Loading…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Attendance</h3><p>Per-class marking</p></div>
          <div className="sa-inline-actions">
            <select className="sa-select" value={selectedClassId ?? ""} onChange={(e) => setSelectedClassId(Number(e.target.value))}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.course_code} {c.course_title} · {c.section}</option>)}
            </select>
            <button type="button" className="sa-button sa-button-primary" onClick={() => setModalOpen(true)}>＋ New session</button>
          </div>
        </div>
        {sessions.length === 0 ? <EmptyState message="No sessions yet." /> : (
          <div className="sa-task-list">
            {sessions.map((s) => (
              <div key={s.id} className="sa-task-row">
                <div className="sa-task-dot" aria-hidden="true">◷</div>
                <div className="sa-task-info"><strong>{new Date(s.session_date).toLocaleDateString()}</strong><span>{s.topic || "No topic"}</span></div>
                <button type="button" className="sa-button sa-button-outline" onClick={() => openSession(s.id)}>Open</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSession && (
        <div className="sa-panel">
          <div className="sa-panel-heading"><h3>Mark attendance</h3></div>
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
          <button type="button" className="sa-button sa-button-primary" onClick={save}>Save attendance</button>
        </div>
      )}

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title="New session" submitLabel="Create" fields={[
          { name: "session_date", label: "Date", type: "date", required: true },
          { name: "topic", label: "Topic" },
        ]} onClose={() => setModalOpen(false)} onSubmit={async (v) => { await createSession(v.session_date, v.topic); setModalOpen(false); }} />
      )}
    </div>
  );
}