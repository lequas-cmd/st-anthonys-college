import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import { TeacherDashboardResponse } from "../TeacherDashboard";
import LoadingState from "../../admin/components/LoadingState";
import ErrorState from "../../admin/components/ErrorState";
import EmptyState from "../../admin/components/EmptyState";

type Props = { data: TeacherDashboardResponse | null; loading: boolean };

export default function ResourcesPage({ data, loading: parentLoading }: Props) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<any>("/dashboard/teacher/timetable");
        setEntries(res.entries || []);
      } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
      finally { setLoading(false); }
    })();
  }, []);

  if (parentLoading || loading) return <LoadingState message="Loading timetable…" />;
  if (error) return <ErrorState message={error} />;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const byDay = days.map((d, i) => ({ day: d, idx: i + 1, slots: entries.filter((e) => Number(e.weekday) === i + 1) }));

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Weekly timetable</h3><p>{entries.length} slots</p></div>
        </div>
        {entries.length === 0 ? <EmptyState message="No timetable entries." /> : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Day</th><th>Start</th><th>End</th><th>Course</th><th>Section</th><th>Room</th><th>Status</th></tr></thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td>{days[Number(e.weekday) - 1] || e.weekday}</td>
                    <td>{e.starts_at}</td>
                    <td>{e.ends_at}</td>
                    <td>{e.course_code} {e.course_title}</td>
                    <td>{e.section}</td>
                    <td>{e.room_name || e.room || "—"}</td>
                    <td>{e.schedule_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="sa-st-grid2">
        {byDay.map((d) => (
          <div key={d.day} className="sa-panel">
            <div className="sa-panel-heading"><h3>{d.day}</h3></div>
            {d.slots.length === 0 ? <p>No classes.</p> : d.slots.map((s) => (
              <div key={s.id} className="sa-task-row">
                <div className="sa-task-dot" aria-hidden="true">{d.day.slice(0, 2)}</div>
                <div className="sa-task-info">
                  <strong>{s.course_title}</strong>
                  <span>{s.starts_at} – {s.ends_at}</span>
                  <small>{s.room_name || s.room || "—"} · {s.section}</small>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}