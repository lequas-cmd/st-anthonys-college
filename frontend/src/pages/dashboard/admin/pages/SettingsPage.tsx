import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable from "../components/AdminDataTable";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function SettingsPage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [tab, setTab] = useState<"profile" | "academic" | "terms" | "audit">("profile");
  const [, setSite] = useState<any[]>([]);
  const [, setAcademic] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [siteForm, setSiteForm] = useState<Record<string, string>>({});
  const [acadForm, setAcadForm] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [s, a, y, sem, al] = await Promise.all([
        apiRequest<any>("/dashboard/admin/settings/site"),
        apiRequest<any>("/dashboard/admin/settings/academic"),
        apiRequest<any>("/dashboard/admin/academic-years"),
        apiRequest<any>("/dashboard/admin/semesters"),
        apiRequest<any>("/dashboard/admin/audit-logs?limit=100"),
      ]);
      setSite(s.settings || []);
      setAcademic(a.settings || []);
      setYears(y.academicYears || []);
      setSemesters(sem.semesters || []);
      setAuditLogs(al.auditLogs || []);
      setChanges(al.changes || []);
      const sf: Record<string, string> = {};
      for (const r of s.settings || []) sf[r.setting_key] = r.setting_value ?? "";
      setSiteForm(sf);
      const af: Record<string, string> = {};
      for (const r of a.settings || []) af[r.setting_key] = r.setting_value ?? "";
      setAcadForm(af);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveSite = async () => {
    await apiRequest("/dashboard/admin/settings/site", { method: "PUT", body: JSON.stringify(siteForm) });
    await load();
  };
  const saveAcad = async () => {
    await apiRequest("/dashboard/admin/settings/academic", { method: "PUT", body: JSON.stringify(acadForm) });
    await load();
  };

  if (loading || parentLoading) return <LoadingState message="Loading settings…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Settings & Audit Log</h3><p>College profile, terms, grading scale, audit log</p></div>
          <div className="sa-inline-actions">
            {(["profile", "academic", "terms", "audit"] as const).map((t) => (
              <button key={t} type="button" className={`sa-button ${tab === t ? "sa-button-primary" : "sa-button-outline"}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>

        {tab === "profile" && (
          <div>
            <p>College profile (site settings)</p>
            {Object.keys(siteForm).length === 0 ? <EmptyState message="No site settings." /> : (
              Object.entries(siteForm).map(([k, v]) => (
                <label key={k} className="sa-modal-field">
                  <span>{k}</span>
                  <input value={v} onChange={(e) => setSiteForm({ ...siteForm, [k]: e.target.value })} />
                </label>
              ))
            )}
            <button type="button" className="sa-button sa-button-primary" onClick={saveSite}>Save profile</button>
          </div>
        )}

        {tab === "academic" && (
          <div>
            <p>Academic settings</p>
            {Object.keys(acadForm).length === 0 ? <EmptyState message="No academic settings." /> : (
              Object.entries(acadForm).map(([k, v]) => (
                <label key={k} className="sa-modal-field">
                  <span>{k}</span>
                  <input value={v} onChange={(e) => setAcadForm({ ...acadForm, [k]: e.target.value })} />
                </label>
              ))
            )}
            <button type="button" className="sa-button sa-button-primary" onClick={saveAcad}>Save academic settings</button>
          </div>
        )}

        {tab === "terms" && (
          <div>
            <h4>Academic years</h4>
            <AdminDataTable rows={years} columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Name" },
              { key: "starts_on", label: "Starts" },
              { key: "ends_on", label: "Ends" },
              { key: "is_current", label: "Current", render: (r: any) => r.is_current ? "Yes" : "No" },
            ]} emptyLabel="No years." getRowId={(r: any) => r.id} />
            <h4>Semesters</h4>
            <AdminDataTable rows={semesters} columns={[
              { key: "id", label: "ID" },
              { key: "academic_year_id", label: "Year" },
              { key: "name", label: "Name" },
              { key: "starts_on", label: "Starts" },
              { key: "ends_on", label: "Ends" },
              { key: "is_current", label: "Current", render: (r: any) => r.is_current ? "Yes" : "No" },
            ]} emptyLabel="No semesters." getRowId={(r: any) => r.id} />
          </div>
        )}

        {tab === "audit" && (
          <div>
            <h4>Audit log</h4>
            <AdminDataTable rows={auditLogs} columns={[
              { key: "audit_id", label: "ID" },
              { key: "action", label: "Action", sortable: true },
              { key: "entity_type", label: "Entity" },
              { key: "entity_id", label: "Entity ID" },
              { key: "actor_username", label: "Actor" },
              { key: "created_at", label: "When" },
            ]} emptyLabel="No audit entries." getRowId={(r: any) => r.audit_id} />
            <h4>Grade changes</h4>
            <AdminDataTable rows={changes} columns={[
              { key: "change_id", label: "ID" },
              { key: "audit_id", label: "Audit" },
              { key: "field_name", label: "Field" },
              { key: "old_value", label: "Old" },
              { key: "new_value", label: "New" },
            ]} emptyLabel="No changes." getRowId={(r: any) => r.change_id} />
          </div>
        )}
      </div>
    </div>
  );
}