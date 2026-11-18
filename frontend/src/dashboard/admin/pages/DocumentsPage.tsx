import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable, { Column } from "../components/AdminDataTable";
import AdminCrudModal, { CrudField } from "../components/AdminCrudModal";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function DocumentsPage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [tab, setTab] = useState<"templates" | "archive">("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [t, d] = await Promise.all([
        apiRequest<any>("/dashboard/admin/document-templates"),
        apiRequest<any>("/dashboard/admin/student-documents"),
      ]);
      setTemplates(t.templates || []);
      setDocuments(d.documents || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fields: CrudField[] = [
    { name: "template_name", label: "Template name", required: true },
    { name: "template_type", label: "Type", required: true },
    { name: "body_html", label: "Body HTML", type: "textarea" },
  ];

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setModalOpen(true); };

  const handleSubmit = async (values: Record<string, string>) => {
    const body = { template_name: values.template_name, template_type: values.template_type, body_html: values.body_html };
    if (editing) await apiRequest(`/dashboard/admin/document-templates/${editing.template_id}`, { method: "PUT", body: JSON.stringify(body) });
    else await apiRequest("/dashboard/admin/document-templates", { method: "POST", body: JSON.stringify(body) });
    await load();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await apiRequest(`/dashboard/admin/document-templates/${toDelete}`, { method: "DELETE" });
    setConfirmOpen(false); setToDelete(null); await load();
  };

  if (loading || parentLoading) return <LoadingState message="Loading documents…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Documents</h3><p>Certificate/letter templates and record archive</p></div>
          <div className="sa-inline-actions">
            <button type="button" className={`sa-button ${tab === "templates" ? "sa-button-primary" : "sa-button-outline"}`} onClick={() => setTab("templates")}>Templates</button>
            <button type="button" className={`sa-button ${tab === "archive" ? "sa-button-primary" : "sa-button-outline"}`} onClick={() => setTab("archive")}>Archive</button>
            {tab === "templates" && <button type="button" className="sa-button sa-button-primary" onClick={openAdd}>＋ Add template</button>}
          </div>
        </div>
        {tab === "templates" ? (
          templates.length === 0 ? <EmptyState message="No templates." /> : (
            <AdminDataTable rows={templates} columns={[
              { key: "template_name", label: "Name", sortable: true },
              { key: "template_type", label: "Type" },
              { key: "updated_at", label: "Updated" },
              { key: "actions", label: "Actions", render: (r: any) => (
                <span className="sa-inline-actions">
                  <button type="button" className="sa-button sa-button-outline" onClick={() => openEdit(r)}>Edit</button>
                  <button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete(r.template_id); setConfirmOpen(true); }}>Delete</button>
                </span>
              )},
            ]} emptyLabel="No templates." getRowId={(r: any) => r.template_id} />
          )
        ) : (
          documents.length === 0 ? <EmptyState message="No archived documents." /> : (
            <AdminDataTable rows={documents} columns={[
              { key: "student_number", label: "Student" },
              { key: "first_name", label: "Name", render: (r: any) => `${r.first_name} ${r.last_name}` },
              { key: "document_type", label: "Type" },
              { key: "file_name", label: "File" },
              { key: "generated_at", label: "Generated" },
            ]} emptyLabel="No documents." getRowId={(r: any) => r.document_id} />
          )
        )}
      </div>

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title={editing ? "Edit template" : "Add template"} submitLabel={editing ? "Save" : "Create"} fields={fields.map((f) => {
          if (!editing) return f;
          const valMap: Record<string, any> = { template_name: editing.template_name, template_type: editing.template_type, body_html: editing.body_html };
          return { ...f, defaultValue: valMap[f.name] ?? f.defaultValue };
        })} onClose={() => setModalOpen(false)} onSubmit={async (v) => { await handleSubmit(v); setModalOpen(false); }} />
      )}
      <ConfirmDialog open={confirmOpen} title="Delete template" message="Delete this template?" onConfirm={handleDelete} onCancel={() => { setConfirmOpen(false); setToDelete(null); }} />
    </div>
  );
}