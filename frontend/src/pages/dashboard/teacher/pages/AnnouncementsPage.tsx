import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import { TeacherClass } from "../TeacherDashboard";
import AdminCrudModal from "../../admin/components/AdminCrudModal";
import LoadingState from "../../admin/components/LoadingState";
import ErrorState from "../../admin/components/ErrorState";
import EmptyState from "../../admin/components/EmptyState";

type Props = { data: any; loading: boolean };

export default function AnnouncementsPage({ data, loading: parentLoading }: Props) {
  const classes: TeacherClass[] = data?.classes ?? [];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiRequest<any>("/dashboard/teacher/announcements");
      setItems(res.announcements || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (parentLoading || loading) return <LoadingState message="Loading announcements…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Announcements</h3><p>Post notices to your classes</p></div>
          <button type="button" className="sa-button sa-button-primary" onClick={() => setModalOpen(true)}>＋ Post notice</button>
        </div>
        {items.length === 0 ? <EmptyState message="No announcements." /> : (
          <div className="sa-task-list">
            {items.map((a) => (
              <div key={a.id} className="sa-task-row">
                <div className="sa-task-dot" aria-hidden="true">◉</div>
                <div className="sa-task-info">
                  <strong>{a.title}</strong>
                  <span>{a.body}</span>
                  <small>{a.published_at ? new Date(a.published_at).toLocaleDateString() : new Date(a.created_at).toLocaleDateString()}</small>
                </div>
                <span className="sa-badge info">{a.audience}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title="Post notice" submitLabel="Publish" fields={[
          { name: "class_id", label: "Class", type: "select", required: true, options: classes.map((c) => ({ value: String(c.id), label: `${c.course_code} ${c.course_title} · ${c.section}` })) },
          { name: "title", label: "Title", required: true },
          { name: "body", label: "Message", type: "textarea", required: true },
        ]} onClose={() => setModalOpen(false)} onSubmit={async (v) => {
          await apiRequest(`/dashboard/teacher/classes/${v.class_id}/announcements`, { method: "POST", body: JSON.stringify({ title: v.title, body: v.body }) });
          setModalOpen(false); await load();
        }} />
      )}
    </div>
  );
}