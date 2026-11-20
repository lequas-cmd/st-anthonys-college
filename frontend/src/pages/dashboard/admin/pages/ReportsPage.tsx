import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable from "../components/AdminDataTable";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function ReportsPage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [tab, setTab] = useState<"enrollment" | "attendance" | "results">("enrollment");
  const [enrollment, setEnrollment] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [e, a, r] = await Promise.all([
        apiRequest<any>("/dashboard/admin/reports/enrollment"),
        apiRequest<any>("/dashboard/admin/reports/attendance"),
        apiRequest<any>("/dashboard/admin/reports/results"),
      ]);
      setEnrollment(e.enrollment || []);
      setAttendance(a.attendance || []);
      setResults(r.results || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const exportCsv = async (name: string, rows: any[]) => {
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${name}.csv`; a.click(); URL.revokeObjectURL(url);
    await apiRequest("/dashboard/admin/reports/export", { method: "POST", body: JSON.stringify({ module_code: "reports", entity_name: name, file_type: "csv", row_count: rows.length }) }).catch(() => {});
  };

  if (loading || parentLoading) return <LoadingState message="Loading reports…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Reports</h3><p>Enrollment, attendance, results</p></div>
          <div className="sa-inline-actions">
            {(["enrollment", "attendance", "results"] as const).map((t) => (
              <button key={t} type="button" className={`sa-button ${tab === t ? "sa-button-primary" : "sa-button-outline"}`} onClick={() => setTab(t)}>{t}</button>
            ))}
            <button type="button" className="sa-button sa-button-outline" onClick={() => window.print()}>Export PDF</button>
          </div>
        </div>

        {tab === "enrollment" && (
          enrollment.length === 0 ? <EmptyState message="No data." /> : (
            <>
              <button type="button" className="sa-button sa-button-outline" onClick={() => exportCsv("enrollment", enrollment)}>Export Excel (CSV)</button>
              <AdminDataTable rows={enrollment} columns={[
                { key: "program", label: "Program", sortable: true },
                { key: "students", label: "Students", sortable: true },
              ]} emptyLabel="No data." getRowId={(r: any) => r.program} />
            </>
          )
        )}
        {tab === "attendance" && (
          attendance.length === 0 ? <EmptyState message="No data." /> : (
            <>
              <button type="button" className="sa-button sa-button-outline" onClick={() => exportCsv("attendance", attendance)}>Export Excel (CSV)</button>
              <AdminDataTable rows={attendance} columns={[
                { key: "courseCode", label: "Course" },
                { key: "courseTitle", label: "Title" },
                { key: "totalSessions", label: "Sessions" },
                { key: "presentWeighted", label: "Present (weighted)" },
                { key: "attendanceRate", label: "Rate %" },
              ]} emptyLabel="No data." getRowId={(r: any) => r.courseCode} />
            </>
          )
        )}
        {tab === "results" && (
          results.length === 0 ? <EmptyState message="No data." /> : (
            <>
              <button type="button" className="sa-button sa-button-outline" onClick={() => exportCsv("results", results)}>Export Excel (CSV)</button>
              <AdminDataTable rows={results} columns={[
                { key: "courseCode", label: "Course" },
                { key: "courseTitle", label: "Title" },
                { key: "grades", label: "Grades" },
                { key: "avgScore", label: "Avg score" },
              ]} emptyLabel="No data." getRowId={(r: any) => r.courseCode} />
            </>
          )
        )}
      </div>
    </div>
  );
}