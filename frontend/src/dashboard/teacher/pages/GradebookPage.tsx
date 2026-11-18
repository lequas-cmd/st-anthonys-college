import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../../services/api";
import { TeacherClass, TeacherRosterStudent, TeacherAssessment } from "../TeacherDashboard";
import AdminCrudModal, { CrudField } from "../../admin/components/AdminCrudModal";
import LoadingState from "../../admin/components/LoadingState";
import ErrorState from "../../admin/components/ErrorState";
import EmptyState from "../../admin/components/EmptyState";

type Props = { classes: TeacherClass[]; selectedClassId: number | null; loading: boolean; onSelectClass: (id: number) => void };

type CellState = "idle" | "saving" | "saved" | "error";

const ABSENT = "A";
const EXCUSED = "E";

function letterGrade(score: number | null, scale: any): string {
  if (score == null) return "—";
  if (!scale?.rules?.length) return score >= 50 ? "Pass" : "Fail";
  const rule = scale.rules.find((r: any) => score >= Number(r.minimum_score) && score <= Number(r.maximum_score));
  return rule ? rule.letter_grade : "—";
}

function cellTotal(student: TeacherRosterStudent, assessments: TeacherAssessment[]): number | null {
  let weighted = 0; let weightSum = 0; let hasAny = false;
  for (const a of assessments) {
    const cell = student.grades?.[a.id];
    const v = cell?.value;
    if (v == null) continue;
    hasAny = true;
    const pct = (v / (cell.max_score || a.max_score || 100)) * 100;
    weighted += pct * (a.weight || 0);
    weightSum += a.weight || 0;
  }
  if (!hasAny) return null;
  if (weightSum === 0) {
    // simple average
    const vals = assessments.map((a) => student.grades?.[a.id]?.value).filter((x) => x != null) as number[];
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  return weighted / weightSum;
}

export default function GradebookPage({ classes, selectedClassId, loading: parentLoading, onSelectClass }: Props) {
  const [cls, setCls] = useState<TeacherClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<any>(null);
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalFields, setModalFields] = useState<CrudField[]>([]);
  const [modalHandler, setModalHandler] = useState<(v: Record<string, string>) => Promise<void>>(async () => {});
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const selected = classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null;

  const loadClass = async (id: number) => {
    setLoading(true); setError(null);
    try {
      const res = await apiRequest<any>(`/dashboard/teacher/classes/${id}`);
      // normalize to TeacherClass shape
      const roster = (res.roster || []).map((s: any) => ({
        id: s.student_id,
        student_number: s.student_number,
        first_name: s.first_name,
        last_name: s.last_name,
        program: s.program || "—",
        attendance_pct: 0,
        current_grade_value: null,
        current_grade: "—",
        grades: {},
      }));
      // fetch grades for this offering
      const gres = await apiRequest<any>(`/dashboard/teacher/grades?offering_id=${id}`);
      const gradesByStudent: Record<number, Record<number, any>> = {};
      for (const g of gres.grades || []) {
        if (!gradesByStudent[g.student_id]) gradesByStudent[g.student_id] = {};
        gradesByStudent[g.student_id][g.assessment_id] = {
          grade_id: g.grade_id,
          value: g.score == null ? null : Number(g.score),
          locked_at: g.locked_at,
          max_score: Number(g.max_score),
        };
      }
      for (const s of roster) s.grades = gradesByStudent[s.id] || {};
      // attendance pct not available here; leave 0
      const cls: TeacherClass = {
        id: res.id,
        course_code: res.course_code,
        course_title: res.course_title,
        section: res.section,
        room: res.room,
        semester_name: res.semester_name,
        student_count: roster.length,
        next_class: "",
        pending_grades: 0,
        roster,
        assessments: (res.assessments || []).map((a: any) => ({
          id: a.assessment_id ?? a.id,
          title: a.title,
          type: a.assessment_type ?? a.type,
          max_score: Number(a.max_score),
          weight: Number(a.weight_percent ?? a.weight ?? 0),
          due_date: a.due_date,
          published: Boolean(a.published),
        })),
        announcements: [],
        timetable: [],
      };
      setCls(cls);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load class."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selected?.id) loadClass(selected.id);
    apiRequest<any>("/dashboard/teacher/grading-scales").then((r) => {
      const scales = r.gradingScales || [];
      setScale(scales.find((s: any) => s.is_default) || scales[0] || null);
    }).catch(() => {});
  }, [selected?.id]);

  const openModal = (title: string, fields: CrudField[], handler: (v: Record<string, string>) => Promise<void>) => {
    setModalTitle(title); setModalFields(fields); setModalHandler(() => handler); setModalOpen(true);
  };

  const ensureGradeRow = async (studentId: number, assessmentId: number): Promise<number | null> => {
    if (!selected) return null;
    const res = await apiRequest<any>(`/dashboard/teacher/classes/${selected.id}/grades`, {
      method: "POST", body: JSON.stringify({ student_id: studentId, assessment_id: assessmentId }),
    });
    return res.gradeId;
  };

  const saveCell = async (studentId: number, assessmentId: number, raw: string) => {
    const key = `${studentId}-${assessmentId}`;
    const assessment = cls?.assessments.find((a) => a.id === assessmentId);
    const max = assessment?.max_score ?? 100;
    const student = cls?.roster.find((s) => s.id === studentId);
    const cell = student?.grades?.[assessmentId];

    // validate
    const trimmed = raw.trim();
    let value: number | null = null;
    if (trimmed === "" || trimmed.toLowerCase() === "a" || trimmed.toLowerCase() === "absent") {
      value = null; // blank/absent
    } else if (trimmed.toLowerCase() === "e" || trimmed.toLowerCase() === "excused") {
      value = null;
    } else {
      const n = Number(trimmed);
      if (!Number.isFinite(n)) { setCellStates((p) => ({ ...p, [key]: "error" })); return; }
      if (n < 0 || n > max) { setCellStates((p) => ({ ...p, [key]: "error" })); return; }
      value = n;
    }

    setCellStates((p) => ({ ...p, [key]: "saving" }));
    try {
      let gradeId = cell?.grade_id ?? null;
      if (!gradeId) gradeId = await ensureGradeRow(studentId, assessmentId);
      if (!gradeId) throw new Error("No grade row");
      await apiRequest(`/dashboard/grades/${gradeId}`, { method: "PUT", body: JSON.stringify({ score: value, feedback: null }) });
      // update local state
      setCls((prev) => {
        if (!prev) return prev;
        const roster = prev.roster.map((s) => {
          if (s.id !== studentId) return s;
          const grades = { ...s.grades };
          grades[assessmentId] = { grade_id: gradeId, value, locked_at: null, max_score: max };
          return { ...s, grades };
        });
        return { ...prev, roster };
      });
      setCellStates((p) => ({ ...p, [key]: "saved" }));
      setTimeout(() => setCellStates((p) => ({ ...p, [key]: "idle" })), 1200);
    } catch {
      setCellStates((p) => ({ ...p, [key]: "error" }));
    }
  };

  const addAssessment = async (v: Record<string, string>) => {
    if (!selected) return;
    await apiRequest(`/dashboard/teacher/classes/${selected.id}/assessments`, {
      method: "POST", body: JSON.stringify({ title: v.title, assessment_type: v.type, max_score: Number(v.max_score || 100), weight_percent: Number(v.weight || 0), due_date: v.due_date || null, published: true }),
    });
    await loadClass(selected.id);
  };

  const deleteAssessment = async (id: number) => {
    await apiRequest(`/dashboard/teacher/assessments/${id}`, { method: "DELETE" });
    if (selected) await loadClass(selected.id);
  };

  const renameAssessment = async (id: number, title: string) => {
    await apiRequest(`/dashboard/teacher/assessments/${id}`, { method: "PUT", body: JSON.stringify({ title }) });
    if (selected) await loadClass(selected.id);
  };

  const submitFinal = async () => {
    if (!selected || !cls) return;
    setSubmitting(true);
    try {
      // lock all grades in this class
      for (const a of cls.assessments) {
        for (const s of cls.roster) {
          const cell = s.grades?.[a.id];
          if (cell?.grade_id && cell.value != null) {
            await apiRequest(`/dashboard/grades/${cell.grade_id}`, { method: "PUT", body: JSON.stringify({ score: cell.value, lock: true }) });
          }
        }
      }
      // create approval batch
      await apiRequest("/dashboard/teacher/result-approval-batches", { method: "POST", body: JSON.stringify({ offering_id: selected.id, status: "submitted" }) });
      await loadClass(selected.id);
    } finally { setSubmitting(false); }
  };

  const exportCsv = () => {
    if (!cls) return;
    const headers = ["Student ID", "Name", ...cls.assessments.map((a) => a.title), "Total", "Grade"];
    const rows = cls.roster.map((s) => {
      const cells = cls.assessments.map((a) => {
        const v = s.grades?.[a.id]?.value;
        return v == null ? "" : String(v);
      });
      const total = cellTotal(s, cls.assessments);
      return [s.student_number, `${s.first_name} ${s.last_name}`, ...cells, total == null ? "" : total.toFixed(2), letterGrade(total, scale)];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${cls.course_code}-gradebook.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    if (!cls) return;
    const headers = ["student_number", ...cls.assessments.map((a) => a.title)];
    const csv = headers.join(",");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${cls.course_code}-import-template.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const idIdx = header.indexOf("student_number");
    if (idIdx < 0) { alert("CSV must include student_number column"); return; }
    const assessmentCols = header.map((h, i) => ({ name: h, index: i })).filter((c) => c.index !== idIdx);
    const preview: string[] = [];
    const errors: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const sn = cols[idIdx];
      const student = cls?.roster.find((s) => s.student_number === sn);
      if (!student) { errors.push(`Row ${i}: student ${sn} not found`); continue; }
      for (const col of assessmentCols) {
        const a = cls?.assessments.find((x) => x.title === col.name);
        if (!a) { errors.push(`Row ${i}: unknown assessment ${col.name}`); continue; }
        const raw = cols[col.index];
        if (raw === "") continue;
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 0 || n > a.max_score) { errors.push(`Row ${i}: invalid value ${raw} for ${col.name}`); continue; }
        preview.push(`${sn} ${col.name}=${n}`);
      }
    }
    const msg = `Preview: ${preview.length} cells. Errors: ${errors.length}. Apply?`;
    if (errors.length) alert(errors.join("\n"));
    if (!window.confirm(msg)) return;
    // apply
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const sn = cols[idIdx];
      const student = cls?.roster.find((s) => s.student_number === sn);
      if (!student) continue;
      for (const col of assessmentCols) {
        const a = cls?.assessments.find((x) => x.title === col.name);
        if (!a) continue;
        const raw = cols[col.index];
        if (raw === "") continue;
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 0 || n > a.max_score) continue;
        await saveCell(student.id, a.id, String(n));
      }
    }
    if (selected) await loadClass(selected.id);
  };

  const stats = useMemo(() => {
    if (!cls) return null;
    const totals = cls.roster.map((s) => cellTotal(s, cls.assessments)).filter((x) => x != null) as number[];
    if (totals.length === 0) return null;
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const high = Math.max(...totals);
    const low = Math.min(...totals);
    const pass = totals.filter((t) => t >= 50).length;
    const passRate = Math.round((pass / totals.length) * 100);
    return { avg: avg.toFixed(2), high: high.toFixed(2), low: low.toFixed(2), passRate };
  }, [cls]);

  if (parentLoading) return <LoadingState message="Loading gradebook…" />;
  if (loading) return <LoadingState message="Loading class…" />;
  if (error) return <ErrorState message={error} />;
  if (!cls) return <EmptyState message="Select a class to view the gradebook." />;

  const locked = cls.roster.some((s) => Object.values(s.grades ?? {}).some((c: any) => c?.locked_at));

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div>
            <h3>Gradebook</h3>
            <p>{cls.course_code} {cls.course_title} · {cls.section} · {cls.semester_name}</p>
          </div>
          <div className="sa-inline-actions">
            <select aria-label="Select class" className="sa-select" value={selected?.id ?? ""} onChange={(e) => onSelectClass(Number(e.target.value))}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.course_code} • {c.section}</option>)}
            </select>
            <button type="button" className="sa-button sa-button-outline" onClick={() => openModal("Add assessment", "Create", [
              { name: "title", label: "Title", required: true },
              { name: "type", label: "Type", type: "select", options: [
                { value: "quiz", label: "Quiz" }, { value: "assignment", label: "Assignment" },
                { value: "midterm", label: "Midterm" }, { value: "final", label: "Final" },
                { value: "practical", label: "Practical" }, { value: "project", label: "Project" }, { value: "other", label: "Other" },
              ]},
              { name: "max_score", label: "Max score", type: "number" },
              { name: "weight", label: "Weight %", type: "number" },
              { name: "due_date", label: "Due date", type: "date" },
            ], addAssessment)}>＋ Assessment</button>
            <button type="button" className="sa-button sa-button-outline" onClick={downloadTemplate}>Template</button>
            <label className="sa-button sa-button-outline">
              Import CSV
              <input type="file" accept=".csv" className="sa-hidden" onChange={(e) => { if (e.target.files?.[0]) importCsv(e.target.files[0]); e.target.value = ""; }} />
            </label>
            <button type="button" className="sa-button sa-button-outline" onClick={exportCsv}>Export CSV</button>
            <button type="button" className="sa-button sa-button-primary" onClick={submitFinal} disabled={submitting || locked}>{submitting ? "Submitting…" : locked ? "Locked" : "Submit final"}</button>
          </div>
        </div>

        {locked && <div className="sa-alert-panel">Grade sheet is locked. Changes require registrar unlock.</div>}

        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th className="sa-sticky-head">Student</th>
                {cls.assessments.map((a) => (
                  <th key={a.id}>
                    <div>{a.title}</div>
                    <small>max {a.max_score} · w {a.weight}%</small>
                    <div className="sa-inline-actions">
                      <button type="button" className="sa-link-button" onClick={() => { const t = window.prompt("Rename assessment", a.title); if (t) renameAssessment(a.id, t); }}>Rename</button>
                      <button type="button" className="sa-link-button" onClick={() => { if (window.confirm("Delete assessment?")) deleteAssessment(a.id); }}>Delete</button>
                    </div>
                  </th>
                ))}
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {cls.roster.map((s) => {
                const total = cellTotal(s, cls.assessments);
                const grade = letterGrade(total, scale);
                const failing = total != null && total < 50;
                return (
                  <tr key={s.id} className={failing ? "sa-row-failing" : undefined}>
                    <td className="sa-sticky-col">
                      <div className="sa-admin-student"><strong>{s.first_name} {s.last_name}</strong><small>{s.student_number}</small></div>
                    </td>
                    {cls.assessments.map((a) => {
                      const cell = s.grades?.[a.id];
                      const key = `${s.id}-${a.id}`;
                      const state = cellStates[key] || "idle";
                      const lockedCell = !!cell?.locked_at;
                      const raw = edits[key] ?? (cell?.value == null ? "" : String(cell.value));
                      const missing = cell?.value == null;
                      return (
                        <td key={a.id} className={missing ? "sa-cell-missing" : undefined}>
                          <input
                            className="sa-score-input"
                            value={raw}
                            disabled={locked || lockedCell}
                            onChange={(e) => setEdits((p) => ({ ...p, [key]: e.target.value }))}
                            onBlur={() => saveCell(s.id, a.id, edits[key] ?? raw)}
                            onKeyDown={(e) => {
                              // basic: Enter saves and moves down
                              if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); }
                            }}
                          />
                          {state === "saving" && <small>saving…</small>}
                          {state === "saved" && <small>saved</small>}
                          {state === "error" && <small className="sa-text-error">error</small>}
                        </td>
                      );
                    })}
                    <td><strong>{total == null ? "—" : total.toFixed(2)}</strong></td>
                    <td><strong>{grade}</strong></td>
                  </tr>
                );
              })}
              {stats && (
                <tr className="sa-row-stats">
                  <td className="sa-sticky-col">Class stats</td>
                  {cls.assessments.map((a) => {
                    const vals = cls.roster.map((s) => s.grades?.[a.id]?.value).filter((x) => x != null) as number[];
                    const avg = vals.length ? (vals.reduce((x, y) => x + y, 0) / vals.length).toFixed(1) : "—";
                    return <td key={a.id}>avg {avg}</td>;
                  })}
                  <td>avg {stats.avg}</td>
                  <td>pass {stats.passRate}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {stats && (
          <div className="sa-panel-footer">
            <span>Highest {stats.high} · Lowest {stats.low} · Pass rate {stats.passRate}%</span>
          </div>
        )}
      </div>

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title={modalTitle} submitLabel="Create" fields={modalFields} onClose={() => setModalOpen(false)} onSubmit={async (v) => { await modalHandler(v); setModalOpen(false); }} />
      )}
    </div>
  );
}