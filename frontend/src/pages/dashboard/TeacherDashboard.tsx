import React, { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard-pages.css";
import { apiRequest } from "../../services/api";

type TeacherRow = {
  id: string;
  name: string;
  initials: string;
  task: string;
  scores: number[];
  attendance: string;
  state: "Complete" | "Review";
};

type TeacherRecord = {
  employee_number: string;
  first_name: string;
  last_name: string;
  department: string | null;
};

type TeacherDashboardResponse = {
  total: number;
  teachers: TeacherRecord[];
};

const mapTeachersToRows = (teachers: TeacherRecord[]): TeacherRow[] =>
  teachers.map((teacher) => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.trim();
    const initials = `${teacher.first_name?.[0] ?? ""}${teacher.last_name?.[0] ?? ""}`.toUpperCase();

    return {
      id: teacher.employee_number,
      name: fullName,
      initials,
      task: teacher.department || "Department review",
      scores: [0, 0, 0],
      attendance: "—",
      state: "Review",
    };
  });

export default function TeacherDashboard() {
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTeachers = async () => {
      try {
        const data = await apiRequest<TeacherDashboardResponse>("/dashboard/teacher");
        if (active) {
          setRows(mapTeachersToRows(data.teachers));
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load teacher dashboard data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTeachers();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => rows.filter((row) => `${row.name} ${row.id}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);

  const updateScore = (id: string, index: number, value: string) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, scores: row.scores.map((score, scoreIndex) => scoreIndex === index ? Math.max(0, Math.min(20, Number(value) || 0)) : score) } : row));
    setSaved(false);
  };

  return (
    <div className="sa-dashboard">
      <aside className="sa-sidebar">
        <div className="sa-brand"><div className="sa-crest">SA</div><div><strong>SAINT ANTHONY'S</strong><span>TECHNICAL COLLEGE</span></div></div>
        <div className="sa-role">FACULTY WORKSPACE</div>
        <nav className="sa-nav"><a className="active" href="#gradebook"><span>▦</span> Overview</a><a href="#classes"><span>▤</span> My classes</a><a href="#gradebook"><span>▥</span> Gradebook</a><a href="#attendance"><span>✓</span> Attendance</a><a href="#resources"><span>▧</span> Teaching resources</a><a href="#announcements"><span>◉</span> Announcements</a></nav>
        <div className="sa-sidebar-bottom"><div className="sa-help-icon">?</div><div><strong>Faculty support</strong><span>Teaching & learning office</span></div><span className="sa-chevron">›</span></div>
      </aside>
      <main className="sa-main">
        <header className="sa-topbar"><div className="sa-breadcrumb">Faculty Workspace <span>/</span> Gradebook</div><div className="sa-top-actions"><button className="sa-icon-btn">⌕</button><button className="sa-icon-btn sa-notification">♧<b /></button><div className="sa-avatar">BK</div><div className="sa-user"><strong>Bekele Tadesse</strong><span>Instructor</span></div><button className="sa-more">⌄</button></div></header>
        <section className="sa-content">
          {error && <div className="sa-alert-panel" style={{ marginBottom: 20 }}><strong>Live data unavailable:</strong> {error}</div>}
          <div className="sa-page-heading"><div><div className="sa-eyebrow">FACULTY WORKSPACE / ASSESSMENT</div><h1>Gradebook <span>·</span> Continuous assessment</h1><p>Record, review, and manage student assessment results.</p></div><div className="sa-heading-actions"><button className="sa-button sa-button-outline" onClick={()=>window.print()}>⇩ <span>Export / Print</span></button><button className="sa-button sa-button-primary" onClick={()=>setSaved(true)}>✓ <span>Save changes</span></button></div></div>
          <section className="sa-course-banner"><div className="sa-course-icon">EL</div><div className="sa-course-main"><span className="sa-chip">ACTIVE MODULE</span><h2>Electrical Installation Practice II</h2><p>ELT 204 <span>·</span> Level II, Section B <span>·</span> {rows.length || 0} staff profiles connected</p></div><div className="sa-course-term"><span>ACADEMIC TERM</span><strong>Semester I · 2019 E.C.</strong><small>Last updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</small></div></section>
          <div className="sa-stat-grid sa-teacher-stats"><article className="sa-stat-card"><div className="sa-stat-top"><span>Teachers loaded</span><b className="sa-stat-icon gold">∑</b></div><strong>{loading ? "…" : rows.length}</strong><p>Across current records</p></article><article className="sa-stat-card"><div className="sa-stat-top"><span>Department records</span><b className="sa-stat-icon green">✓</b></div><strong>{loading ? "…" : new Set(rows.map((row) => row.task)).size}</strong><p>Unique curriculum groups</p></article><article className="sa-stat-card"><div className="sa-stat-top"><span>Needs review</span><b className="sa-stat-icon rose">!</b></div><strong>{loading ? "…" : rows.filter((row) => row.state === "Review").length}</strong><p className="sa-text-warning">Profiles pending check</p></article><article className="sa-stat-card"><div className="sa-stat-top"><span>Next deadline</span><b className="sa-stat-icon blue">◷</b></div><strong className="sa-date-stat">Oct 16</strong><p>Submit term assessment</p></article></div>
          <section className="sa-panel sa-grade-panel" id="gradebook"><div className="sa-grade-toolbar"><div><h3>Continuous assessment register</h3><p>Scores are out of 20 per assessment. Changes below are local until saved to the backend.</p></div><div className="sa-grade-actions"><label className="sa-search">⌕ <input aria-label="Search students" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff..." /></label><button className="sa-button sa-button-outline" onClick={()=>setRows(mapTeachersToRows(rows.map((row) => ({ employee_number: row.id, first_name: row.name.split(" ")[0] || "", last_name: row.name.split(" ").slice(1).join(" ") || "", department: row.task }))))}>Reset</button></div></div>
            <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>STAFF</th><th>ASSESSMENT 01 <small>/ 20</small></th><th>ASSESSMENT 02 <small>/ 20</small></th><th>ASSESSMENT 03 <small>/ 20</small></th><th>AVERAGE</th><th>ATTENDANCE</th><th>STATUS</th></tr></thead><tbody>{loading ? <tr><td colSpan={7}>Loading teacher records…</td></tr> : filtered.map((row) => { const avg = (row.scores.reduce((a, b) => a + b, 0) / 3 * 5).toFixed(1); return <tr key={row.id}><td><div className="sa-person"><span className="sa-person-avatar">{row.initials}</span><span><strong>{row.name}</strong><small>{row.id}</small></span></div></td>{row.scores.map((score, index) => <td key={index}><input className="sa-score-input" aria-label={`${row.name} assessment ${index + 1}`} type="number" min="0" max="20" value={score} onChange={e => updateScore(row.id, index, e.target.value)} /></td>)}<td><strong className={Number(avg) < 60 ? "sa-text-warning" : "sa-text-good"}>{avg}%</strong></td><td>{row.attendance}</td><td><span className={`sa-badge ${row.state === "Complete" ? "success" : "warning"}`}>{row.state}</span></td></tr>; })}</tbody></table></div>
            <div className="sa-table-footer"><span>Showing {filtered.length} of {rows.length} teacher records</span><span className={saved ? "sa-save-status" : "sa-save-status muted"}>{saved ? "Changes marked for saving" : "Not connected to live database"}</span></div>
          </section>
          <div className="sa-teacher-bottom"><section className="sa-panel"><div className="sa-panel-heading"><h3>Assessment weighting</h3><a href="#gradebook">View policy →</a></div><div className="sa-weight-row"><span>Continuous assessments</span><strong>20%</strong><div className="sa-progress"><i className="gold" style={{width:"20%"}} /></div></div><div className="sa-weight-row"><span>Practical project</span><strong>20%</strong><div className="sa-progress"><i className="blue" style={{width:"20%"}} /></div></div><div className="sa-weight-row"><span>Midterm examination</span><strong>20%</strong><div className="sa-progress"><i className="green" style={{width:"20%"}} /></div></div><div className="sa-weight-row"><span>Final examination</span><strong>40%</strong><div className="sa-progress"><i className="rose" style={{width:"40%"}} /></div></div></section><section className="sa-panel"><div className="sa-panel-heading"><h3>Instructor reminders</h3><span className="sa-badge warning">{rows.filter((row) => row.state === "Review").length || 0} pending</span></div><div className="sa-reminder"><b>!</b><div><strong>Review flagged teacher profiles</strong><p>Check any incomplete records and confirm workload assignments.</p></div></div><div className="sa-reminder"><b>◷</b><div><strong>Submit marks by October 16</strong><p>Ensure all marks are reviewed before publishing.</p></div></div></section></div>
          <footer className="sa-footer">© 2026 Saint Anthony’s Technical and Vocational College <span>Faculty academic workspace.</span></footer>
        </section>
      </main>
    </div>
  );
}
