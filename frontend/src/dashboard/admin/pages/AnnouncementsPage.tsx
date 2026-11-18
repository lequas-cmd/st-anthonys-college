import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable, { Column } from "../components/AdminDataTable";
import AdminCrudModal, { CrudField } from "../components/AdminCrudModal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function AnnouncementsPage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiRequest<any>("/dashboard/admin/announcements");
      setItems(res.announcements || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fields: CrudField[] = [
    { name: "title", label: "Title", required: true },
    { name: "body", label: "Body", type: "textarea", required: true },
    { name: "audience", label: "Audience", type: "select", options: [
      { value: "everyone", label: "Everyone" }, { value: "students", label: "Students" },
      { value: "teachers", label: "Teachers" }, { value: "staff", label: "Staff" },
    ]},
    { name: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" },
    ]},
    { name: "published_at", label: "Published at" },
    { name: "expires_at", label: "Expires at" },
    { name: "department_id", label: "Department ID", type: "number" },
    { name: "class_group_id", label: "Class group ID", type: "number" },
  ];

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (a: any) => { setEditing(a); setModalOpen(true); };

  const handleSubmit = async (values: Record<string, string>) => {
    const body: any = {
      title: values.title, body: values.body, audience: values.audience, status: values.status,
      published_at: values.published_at || undefined, expires_at: values.expires_at || undefined,
      department_id: values.department_id ? Number(values.department_id) : undefined,
      class_group_id: values.class_group_id ? Number(values.class_group_id) : undefined,
    };
    if (editing) await apiRequest(`/dashboard/admin/announcements/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
    else await apiRequest("/dashboard/admin/announcements", { method: "POST", body: JSON.stringify(body) });
    await load();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await apiRequest(`/dashboard/admin/announcements/${toDelete}`, { method: "DELETE" });
    setConfirmOpen(false); setToDelete(null); await load();
  };

  const columns: Column<any>[] = [
    { key: "title", label: "Title", sortable: true },
    { key: "audience", label: "Audience" },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge label={r.status} tone={r.status === "published" ? "success" : r.status === "draft" ? "warning" : "info"} /> },
    { key: "published_at", label: "Published", render: (r: any) => r.published_at ? new Date(r.published_at).toLocaleDateString() : "—" },
    { key: "actions", label: "Actions", render: (r: any) => (
      <span className="sa-inline-actions">
        <button type="button" className="sa-button sa-button-outline" onClick={() => openEdit(r)}>Edit</button>
        <button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete(r.id); setConfirmOpen(true); }}>Delete</button>
      </span>
    )},
  ];

  if (loading || parentLoading) return <LoadingState message="Loading announcements…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Announcements</h3><p>{items.length} notices</p></div>
          <button type="button" className="sa-button sa-button-primary" onClick={openAdd}>＋ Add</button>
        </div>
        {items.length === 0 ? <EmptyState message="No announcements." /> : (
          <AdminDataTable rows={items} columns={columns} emptyLabel="No announcements." getRowId={(r: any) => r.id} selectable />
        )}
      </div>

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title={editing ? "Edit announcement" : "Add announcement"} submitLabel={editing ? "Save" : "Create"} fields={fields.map((f) => {
          if (!editing) return f;
          const valMap: Record<string, any> = { title: editing.title, body: editing.body, audience: editing.audience, status: editing.status, published_at: editing.published_at, expires_at: editing.expires_at, department_id: editing.department_id, class_group_id: editing.class_group_id };
          return { ...f, defaultValue: valMap[f.name] ?? f.defaultValue };
        })} onClose={() => setModalOpen(false)} onSubmit={async (v) => { await handleSubmit(v); setModalOpen(false); }} />
      )}
      <ConfirmDialog open={confirmOpen} title="Delete announcement" message="Delete this announcement?" onConfirm={handleDelete} onCancel={() => { setConfirmOpen(false); setToDelete(null); }} />
    </div>
  );
}