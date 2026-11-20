import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable from "../components/AdminDataTable";
import AdminCrudModal, { CrudField } from "../components/AdminCrudModal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function ExamsPage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [tab, setTab] = useState<"schedule" | "grades" | "scale" | "publish">("schedule");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [examSchedules, setExamSchedules] = useState<any[]>([]);
  const [, setAssessments] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null);
  const [gradingScales, setGradingScales] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [, setRooms] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubmit, setModalSubmit] = useState("Save");
  const [modalFields, setModalFields] = useState<CrudField[]>([]);
  const [modalHandler, setModalHandler] = useState<(v: Record<string, string>) => Promise<void>>(async () => {});

  const [gradeEdits, setGradeEdits] = useState<Record<number, { score: string; feedback: string; lock: boolean }>>({});

  const loadAll = async () => {
    setLoading(true); setError(null);
    try {
      const [es, as, off, gs, ba, rm] = await Promise.all([
        apiRequest<any>("/dashboard/admin/exam-schedules"),
        apiRequest<any>("/dashboard/admin/assessments"),
        apiRequest<any>("/dashboard/admin/offerings"),
        apiRequest<any>("/dashboard/admin/grading-scales"),
        apiRequest<any>("/dashboard/admin/result-approval-batches"),
        apiRequest<any>("/dashboard/admin/rooms"),
      ]);
      setExamSchedules(es.examSchedules || []);
      setAssessments(as.assessments || []);
      setOfferings(off.offerings || []);
      setGradingScales(gs.gradingScales || []);
      setBatches(ba.batches || []);
      setRooms(rm.rooms || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const loadGrades = async (offeringId: number) => {
    setSelectedOffering(offeringId);
    const res = await apiRequest<any>(`/dashboard/admin/grades?offering_id=${offeringId}`);
    setGrades(res.grades || []);
    const edits: Record<number, { score: string; feedback: string; lock: boolean }> = {};
    for (const g of res.grades || []) {
      edits[g.grade_id] = { score: g.score == null ? "" : String(g.score), feedback: g.feedback || "", lock: false };
    }
    setGradeEdits(edits);
  };

  const openModal = (title: string, submit: string, fields: CrudField[], handler: (v: Record<string, string>) => Promise<void>) => {
    setModalTitle(title); setModalSubmit(submit); setModalFields(fields); setModalHandler(() => handler); setModalOpen(true);
  };

  const submitGrade = async (gradeId: number) => {
    const e = gradeEdits[gradeId];
    if (!e) return;
    const score = Number(e.score);
    if (!Number.isFinite(score)) { alert("Enter a valid score"); return; }
    await apiRequest(`/dashboard/grades/${gradeId}`, { method: "PUT", body: JSON.stringify({ score, feedback: e.feedback, lock: e.lock }) });
    if (selectedOffering) await loadGrades(selectedOffering);
  };

  if (loading || parentLoading) return <LoadingState message="Loading exams…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Exams & Grading</h3><p>Schedule, grade entry, grading scale, publish control</p></div>
        </div>
        <div className="sa-inline-actions">
          {(["schedule", "grades", "scale", "publish"] as const).map((t) => (
            <button key={t} type="button" className={`sa-button ${tab === t ? "sa-button-primary" : "sa-button-outline"}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "schedule" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Exam schedule</h3><p>{examSchedules.length} exams</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add exam schedule", "Create", [
              { name: "assessment_id", label: "Assessment ID", type: "number", required: true },
              { name: "exam_date", label: "Exam date", type: "date", required: true },
              { name: "starts_at", label: "Starts (HH:MM:SS)", required: true },
              { name: "ends_at", label: "Ends (HH:MM:SS)", required: true },
              { name: "room_id", label: "Room ID", type: "number" },
              { name: "invigilator_teacher_id", label: "Invigilator teacher ID", type: "number" },
              { name: "status", label: "Status", type: "select", options: [
                { value: "scheduled", label: "Scheduled" }, { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" }, { value: "postponed", label: "Postponed" },
              ]},
            ], async (v) => { await apiRequest("/dashboard/admin/exam-schedules", { method: "POST", body: JSON.stringify({ assessment_id: Number(v.assessment_id), exam_date: v.exam_date, starts_at: v.starts_at, ends_at: v.ends_at, room_id: v.room_id ? Number(v.room_id) : null, invigilator_teacher_id: v.invigilator_teacher_id ? Number(v.invigilator_teacher_id) : null, status: v.status }) }); await loadAll(); })}>＋ Add</button>
          </div>
          <AdminDataTable rows={examSchedules} columns={[
            { key: "course_code", label: "Course" },
            { key: "assessment_title", label: "Assessment" },
            { key: "exam_date", label: "Date" },
            { key: "starts_at", label: "Start" },
            { key: "ends_at", label: "End" },
            { key: "room_name", label: "Room", render: (r: any) => r.room_name || "—" },
            { key: "status", label: "Status" },
          ]} emptyLabel="No exams scheduled." getRowId={(r: any) => r.schedule_id} />
        </div>
      )}

      {tab === "grades" && (
        <div className="sa-st-grid2">
          <div className="sa-panel">
            <div className="sa-panel-heading"><h3>Offerings</h3></div>
            <div className="sa-task-list">
              {offerings.map((o) => (
                <div key={o.id} className="sa-task-row">
                  <div className="sa-task-info"><strong>{o.course_code} {o.course_title}</strong><span>{o.semester_name} · {o.section}</span></div>
                  <button type="button" className="sa-button sa-button-outline" onClick={() => loadGrades(o.id)}>Open grades</button>
                </div>
              ))}
            </div>
          </div>
          <div className="sa-panel">
            <div className="sa-panel-heading"><h3>Grade entry</h3><p>{selectedOffering ? `Offering #${selectedOffering}` : "Select an offering"}</p></div>
            {grades.length === 0 ? <EmptyState message="No grades." /> : (
              <div className="sa-table-wrap">
                <table className="sa-table sa-admin-table">
                  <thead><tr><th>Student</th><th>Assessment</th><th>Score</th><th>Feedback</th><th>Locked</th><th></th></tr></thead>
                  <tbody>
                    {grades.map((g) => {
                      const e = gradeEdits[g.grade_id] || { score: "", feedback: "", lock: false };
                      return (
                        <tr key={g.grade_id}>
                          <td>{g.first_name} {g.last_name} <small>{g.student_number}</small></td>
                          <td>{g.assessment_title} (/{g.max_score})</td>
                          <td><input className="sa-score-input" value={e.score} onChange={(ev) => setGradeEdits({ ...gradeEdits, [g.grade_id]: { ...e, score: ev.target.value } })} /></td>
                          <td><input value={e.feedback} onChange={(ev) => setGradeEdits({ ...gradeEdits, [g.grade_id]: { ...e, feedback: ev.target.value } })} /></td>
                          <td>{g.locked_at ? "Yes" : "No"}</td>
                          <td>
                            <label><input type="checkbox" checked={e.lock} onChange={(ev) => setGradeEdits({ ...gradeEdits, [g.grade_id]: { ...e, lock: ev.target.checked } })} /> Lock</label>
                            <button type="button" className="sa-button sa-button-outline" onClick={() => submitGrade(g.grade_id)}>Save</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "scale" && (
        <div className="sa-panel">
          <div className="sa-panel-heading"><h3>Grading scales</h3></div>
          {gradingScales.length === 0 ? <EmptyState message="No grading scales." /> : (
            gradingScales.map((sc) => (
              <div key={sc.scale_id} className="sa-panel">
                <h4>{sc.scale_name} (max GPA {sc.max_gpa}) {sc.is_default ? "— default" : ""}</h4>
                <AdminDataTable rows={sc.rules} columns={[
                  { key: "minimum_score", label: "Min" },
                  { key: "maximum_score", label: "Max" },
                  { key: "letter_grade", label: "Grade" },
                  { key: "grade_point", label: "Points" },
                  { key: "is_pass", label: "Pass", render: (r: any) => r.is_pass ? "Yes" : "No" },
                ]} emptyLabel="No rules." getRowId={(r: any) => r.rule_id} />
              </div>
            ))
          )}
        </div>
      )}

      {tab === "publish" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Publish control (result approval batches)</h3><p>{batches.length} batches</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Create approval batch", "Create", [
              { name: "offering_id", label: "Offering ID", type: "number", required: true },
              { name: "status", label: "Status", type: "select", options: [
                { value: "submitted", label: "Submitted" }, { value: "under_review", label: "Under review" },
                { value: "approved", label: "Approved" }, { value: "published", label: "Published" },
              ]},
            ], async (v) => { await apiRequest("/dashboard/admin/result-approval-batches", { method: "POST", body: JSON.stringify({ offering_id: Number(v.offering_id), status: v.status }) }); await loadAll(); })}>＋ Create</button>
          </div>
          <AdminDataTable rows={batches} columns={[
            { key: "approval_batch_id", label: "Batch" },
            { key: "offering_id", label: "Offering" },
            { key: "status", label: "Status" },
            { key: "submitted_at", label: "Submitted" },
            { key: "published_at", label: "Published" },
            { key: "actions", label: "Actions", render: (r: any) => (
              <span className="sa-inline-actions">
                {r.status !== "published" && <button type="button" className="sa-button sa-button-outline" onClick={async () => { await apiRequest(`/dashboard/admin/result-approval-batches/${r.approval_batch_id}`, { method: "PATCH", body: JSON.stringify({ status: "approved", reviewed_by: 1 }) }); await loadAll(); }}>Approve</button>}
                {r.status !== "published" && <button type="button" className="sa-button sa-button-primary" onClick={async () => { await apiRequest(`/dashboard/admin/result-approval-batches/${r.approval_batch_id}`, { method: "PATCH", body: JSON.stringify({ status: "published" }) }); await loadAll(); }}>Publish</button>}
              </span>
            )},
          ]} emptyLabel="No batches." getRowId={(r: any) => r.approval_batch_id} />
        </div>
      )}

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title={modalTitle} submitLabel={modalSubmit} fields={modalFields} onClose={() => setModalOpen(false)} onSubmit={async (v) => { await modalHandler(v); setModalOpen(false); }} />
      )}
    </div>
  );
}