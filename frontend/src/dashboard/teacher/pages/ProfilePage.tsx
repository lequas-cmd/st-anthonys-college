import React, { useState } from "react";
import { apiRequest } from "../../../../services/api";
import { TeacherDashboardResponse } from "../TeacherDashboard";
import LoadingState from "../../admin/components/LoadingState";
import ErrorState from "../../admin/components/ErrorState";

type Props = { data: TeacherDashboardResponse | null; loading: boolean };

export default function ProfilePage({ data, loading }: Props) {
  const teacher = data?.teacher;
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null); setErr(null);
    try {
      await apiRequest("/dashboard/teacher/profile/password", { method: "PUT", body: JSON.stringify({ password }) });
      setMsg("Password updated.");
      setPassword("");
    } catch (ex) { setErr(ex instanceof Error ? ex.message : "Failed."); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingState message="Loading profile…" />;

  return (
    <div className="sa-st-grid2">
      <section className="sa-panel">
        <div className="sa-panel-heading">
          <div>
            <h3>Faculty profile</h3>
            <p>Teaching responsibilities and profile data</p>
          </div>
        </div>
        <div className="sa-task-list">
          <div className="sa-task-row">
            <div className="sa-task-dot" aria-hidden="true">{teacher?.first_name?.[0] ?? "I"}{teacher?.last_name?.[0] ?? "N"}</div>
            <div className="sa-task-info">
              <strong>{teacher ? `${teacher.first_name} ${teacher.last_name}` : "Instructor profile"}</strong>
              <span>{teacher?.department ?? "Faculty department"}</span>
            </div>
            <span className="sa-badge success">Active</span>
          </div>
          <div className="sa-task-row">
            <div className="sa-task-dot" aria-hidden="true">#</div>
            <div className="sa-task-info"><strong>Employee number</strong><span>{teacher?.employee_number ?? "N/A"}</span></div>
          </div>
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-heading"><h3>Change password</h3></div>
        <form onSubmit={changePassword} className="sa-modal-form">
          <label className="sa-modal-field">
            <span>New password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </label>
          {msg && <div className="sa-alert-panel">{msg}</div>}
          {err && <div className="sa-alert-panel">{err}</div>}
          <button type="submit" className="sa-button sa-button-primary" disabled={saving}>{saving ? "Saving…" : "Update password"}</button>
        </form>
      </section>
    </div>
  );
}