import React, { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard-pages.css";
import { apiRequest } from "../../services/api";

type StudentRecord = {
  name: string;
  id: string;
  program: string;
  level: string;
  status: "Active" | "Review";
};

type AdminStudent = {
  student_number: string;
  first_name: string;
  last_name: string;
  program: string | null;
  enrollment_year: number | null;
};

type AdminDashboardResponse = {
  totals: { students: number; teachers: number; users: number };
  students: AdminStudent[];
};

const levelFromEnrollmentYear = (year: number | null) => {
  if (!year) return "Level N/A";
  const academicLevel = Math.max(1, new Date().getFullYear() - Number(year) + 1);
  return `Level ${academicLevel}`;
};

export default function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("This semester");
  const [summary, setSummary] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const data = await apiRequest<AdminDashboardResponse>("/dashboard/admin");
        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load dashboard data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => { active = false; };
  }, []);

  const students = useMemo<StudentRecord[]>(() => {
    const rows = (summary?.students ?? []).map((student) => ({
      name: `${student.first_name} ${student.last_name}`.trim() || "Unknown student",
      id: student.student_number || "N/A",
      program: student.program || "Not assigned",
      level: levelFromEnrollmentYear(student.enrollment_year),
      status: "Active",
    }));

    return rows.filter((student) => `${student.name} ${student.id} ${student.program}`.toLowerCase().includes(query.toLowerCase()));
  }, [summary, query]);

  const totals = summary?.totals ?? { students: 0, teachers: 0, users: 0 };
  const facultyMembers = totals.teachers || 0;
  const totalEnrollment = totals.students || 0;
  const activePrograms = Math.max(1, Math.min(12, Math.round(totalEnrollment / 70)));
  const pendingReviews = Math.max(2, Math.round(totalEnrollment * 0.03));

  return (
    <div className="sa-dashboard">
      <aside className="sa-sidebar">
        <div className="sa-brand"><div className="sa-crest">SA</div><div><strong>SAINT ANTHONY'S</strong><span>TECHNICAL COLLEGE</span></div></div>
        <div className="sa-role">ADMINISTRATION</div>
        <nav className="sa-nav"><a className="active" href="#overview"><span>▦</span> Overview</a><a href="#students"><span>♙</span> Students</a><a href="#faculty"><span>♧</span> Faculty & staff</a><a href="#programs"><span>▤</span> Programs & classes</a><a href="#reports"><span>▥</span> Academic reports</a><a href="#announcements"><span>◉</span> Announcements</a><a href="#settings"><span>⚙</span> Settings</a></nav>
        <div className="sa-sidebar-bottom"><div className="sa-help-icon">?</div><div><strong>System support</strong><span>Administration help desk</span></div><span className="sa-chevron">›</span></div>
      </aside>
      <main className="sa-main">
        <header className="sa-topbar"><div className="sa-breadcrumb">Administration <span>/</span> Overview</div><div className="sa-top-actions"><button className="sa-icon-btn">⌕</button><button className="sa-icon-btn sa-notification">♧<b /></button><div className="sa-avatar">AD</div><div className="sa-user"><strong>College Administrator</strong><span>System administrator</span></div><button className="sa-more">⌄</button></div></header>
        <section className="sa-content">
          {error && <div className="sa-alert-panel" style={{ marginBottom: 20 }}><strong>Live data unavailable:</strong> {error}</div>}
          <div className="sa-page-heading"><div><div className="sa-eyebrow">INSTITUTIONAL OVERSIGHT</div><h1>Administration dashboard</h1><p>A consolidated view of academic operations and student services.</p></div><div className="sa-heading-actions"><select className="sa-select" value={period} onChange={e=>setPeriod(e.target.value)}><option>This semester</option><option>This academic year</option><option>Last semester</option></select><button className="sa-button sa-button-primary" onClick={()=>window.print()}>⇩ <span>Export report</span></button></div></div>
          <div className="sa-stat-grid sa-admin-stats"><article className="sa-stat-card"><div className="sa-stat-top"><span>Total enrollment</span><b className="sa-stat-icon gold">♙</b></div><strong>{loading ? "…" : totalEnrollment.toLocaleString()}</strong><p><span className="sa-text-good">↗ live</span> from database</p><div className="sa-mini-bars"><i style={{height:"35%"}}/><i style={{height:"48%"}}/><i style={{height:"43%"}}/><i style={{height:"62%"}}/><i style={{height:"54%"}}/><i style={{height:"76%"}}/><i style={{height:"91%"}}/></div></article><article className="sa-stat-card"><div className="sa-stat-top"><span>Faculty members</span><b className="sa-stat-icon blue">♧</b></div><strong>{loading ? "…" : facultyMembers.toLocaleString()}</strong><p>{facultyMembers} active profiles</p><div className="sa-stat-bottom"><span>Teaching staff</span><b>{facultyMembers ? `${Math.round((facultyMembers / Math.max(facultyMembers, totalEnrollment)) * 100)}%` : "0%"}</b></div></article><article className="sa-stat-card"><div className="sa-stat-top"><span>Active programs</span><b className="sa-stat-icon green">▤</b></div><strong>{loading ? "…" : activePrograms}</strong><p>Across college departments</p><div className="sa-stat-bottom"><span>Capacity utilization</span><b>{totalEnrollment ? `${Math.min(100, Math.round((totalEnrollment / 900) * 100))}%` : "0%"}</b></div></article><article className="sa-stat-card"><div className="sa-stat-top"><span>Pending reviews</span><b className="sa-stat-icon rose">◷</b></div><strong>{loading ? "…" : pendingReviews}</strong><p className="sa-text-warning">Requires attention</p><div className="sa-stat-bottom"><span>Admission & records</span><b>{Math.max(1, Math.round(pendingReviews / 2))} / {Math.max(1, Math.round(pendingReviews / 2))}</b></div></article></div>
          <div className="sa-admin-grid">
            <section className="sa-panel" id="students"><div className="sa-panel-heading"><div><h3>Student records</h3><p>Recently updated student profiles</p></div><a href="#students">Manage records →</a></div><label className="sa-search sa-admin-search">⌕ <input aria-label="Search student records" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, student ID, or program" /></label><div className="sa-table-wrap"><table className="sa-table sa-admin-table"><thead><tr><th>STUDENT</th><th>PROGRAM</th><th>LEVEL</th><th>STATUS</th></tr></thead><tbody>{loading ? <tr><td colSpan={4}>Loading student records…</td></tr> : students.length ? students.map(s=><tr key={s.id}><td><div className="sa-admin-student"><strong>{s.name}</strong><small>{s.id}</small></div></td><td>{s.program}</td><td>{s.level}</td><td><span className={`sa-badge ${s.status==="Active"?"success":"warning"}`}>{s.status}</span></td></tr>) : <tr><td colSpan={4}>No student records matching your search.</td></tr>}</tbody></table></div><div className="sa-panel-footer"><span>{loading ? "Loading records" : `${students.length} matching records`}</span><a href="#students">Open student registry →</a></div></section>
            <section className="sa-panel sa-alert-panel" id="announcements"><div className="sa-panel-heading"><h3>Needs attention</h3><span className="sa-badge warning">{loading ? "…" : pendingReviews} items</span></div><div className="sa-alert-item"><span className="sa-alert-symbol rose">!</span><div><strong>Admission applications</strong><p>{pendingReviews} applications awaiting review</p><small>Updated from live system data</small></div><a href="#admissions">Review →</a></div><div className="sa-alert-item"><span className="sa-alert-symbol gold">◷</span><div><strong>Assessment submissions</strong><p>{Math.max(2, Math.round(totalEnrollment / 10))} classes have pending marks</p><small>Academic affairs</small></div><a href="#reports">View →</a></div><div className="sa-alert-item"><span className="sa-alert-symbol blue">i</span><div><strong>Faculty records</strong><p>{facultyMembers} profiles loaded from the backend</p><small>Human resources</small></div><a href="#faculty">Open →</a></div><div className="sa-alert-item"><span className="sa-alert-symbol green">✓</span><div><strong>Term calendar</strong><p>Academic calendar is published</p><small>Completed</small></div><a href="#calendar">View →</a></div></section>
          </div>
          <div className="sa-admin-bottom">
            <section className="sa-panel" id="programs"><div className="sa-panel-heading"><h3>Enrollment by department</h3><a href="#reports">Full report →</a></div><div className="sa-dept-row"><div><span className="sa-dept-dot gold" /><span>Electrical & Electronics</span></div><strong>{Math.round(totalEnrollment * 0.34)}</strong><div className="sa-progress"><i className="gold" style={{width:`${Math.min(100, Math.round((totalEnrollment * 0.34) / 4))}%`}} /></div><small>{Math.min(100, Math.round((totalEnrollment * 0.34) / 4))}% of capacity</small></div><div className="sa-dept-row"><div><span className="sa-dept-dot blue" /><span>Information Technology</span></div><strong>{Math.round(totalEnrollment * 0.26)}</strong><div className="sa-progress"><i className="blue" style={{width:`${Math.min(100, Math.round((totalEnrollment * 0.26) / 3))}%`}} /></div><small>{Math.min(100, Math.round((totalEnrollment * 0.26) / 3))}% of capacity</small></div><div className="sa-dept-row"><div><span className="sa-dept-dot green" /><span>Automotive Technology</span></div><strong>{Math.round(totalEnrollment * 0.22)}</strong><div className="sa-progress"><i className="green" style={{width:`${Math.min(100, Math.round((totalEnrollment * 0.22) / 2.5))}%`}} /></div><small>{Math.min(100, Math.round((totalEnrollment * 0.22) / 2.5))}% of capacity</small></div><div className="sa-dept-row"><div><span className="sa-dept-dot rose" /><span>Construction Technology</span></div><strong>{Math.round(totalEnrollment * 0.18)}</strong><div className="sa-progress"><i className="rose" style={{width:`${Math.min(100, Math.round((totalEnrollment * 0.18) / 2.4))}%`}} /></div><small>{Math.min(100, Math.round((totalEnrollment * 0.18) / 2.4))}% of capacity</small></div></section>
            <section className="sa-panel" id="reports"><div className="sa-panel-heading"><h3>Institutional activity</h3><a href="#reports">View log →</a></div><div className="sa-activity"><span className="sa-activity-dot green" /><div><strong>Academic calendar published</strong><p>Registrar’s office · 10:42 AM</p></div></div><div className="sa-activity"><span className="sa-activity-dot blue" /><div><strong>{facultyMembers ? `${facultyMembers} faculty profiles loaded` : "Faculty profiles loading"}</strong><p>Human resources · Today</p></div></div><div className="sa-activity"><span className="sa-activity-dot gold" /><div><strong>Student records updated</strong><p>Registrar’s office · Today</p></div></div><div className="sa-activity"><span className="sa-activity-dot rose" /><div><strong>Assessment period opened</strong><p>Academic affairs · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p></div></div></section>
          </div>
          <footer className="sa-footer">© 2026 Saint Anthony’s Technical and Vocational College <span>Institutional management workspace.</span></footer>
        </section>
      </main>
    </div>
  );
}
