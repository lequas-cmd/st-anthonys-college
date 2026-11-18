import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable, { Column } from "../components/AdminDataTable";
import AdminCrudModal, { CrudField } from "../components/AdminCrudModal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function UsersRolesPage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [tab, setTab] = useState<"users" | "roles" | "permissions" | "map" | "userroles" | "sessions">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubmit, setModalSubmit] = useState("Save");
  const [modalFields, setModalFields] = useState<CrudField[]>([]);
  const [modalHandler, setModalHandler] = useState<(v: Record<string, string>) => Promise<void>>(async () => {});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [u, r, p, m, ur, s] = await Promise.all([
        apiRequest<any>("/dashboard/admin/users"),
        apiRequest<any>("/dashboard/admin/roles"),
        apiRequest<any>("/dashboard/admin/permissions"),
        apiRequest<any>("/dashboard/admin/role-permission-map"),
        apiRequest<any>("/dashboard/admin/user-roles"),
        apiRequest<any>("/dashboard/admin/user-sessions"),
      ]);
      setUsers(u.users || []);
      setRoles(r.roles || []);
      setPermissions(p.permissions || []);
      setMappings(m.mappings || []);
      setUserRoles(ur.userRoles || []);
      setSessions(s.sessions || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (title: string, submit: string, fields: CrudField[], handler: (v: Record<string, string>) => Promise<void>) => {
    setModalTitle(title); setModalSubmit(submit); setModalFields(fields); setModalHandler(() => handler); setModalOpen(true);
  };

  if (loading || parentLoading) return <LoadingState message="Loading users & roles…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Users & Roles</h3><p>Accounts, roles, permissions, login log</p></div>
          <div className="sa-inline-actions">
            {(["users", "roles", "permissions", "map", "userroles", "sessions"] as const).map((t) => (
              <button key={t} type="button" className={`sa-button ${tab === t ? "sa-button-primary" : "sa-button-outline"}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>

        {tab === "users" && (
          <>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add user", "Create", [
              { name: "username", label: "Username", required: true },
              { name: "password", label: "Password", required: true },
              { name: "role", label: "Role", type: "select", options: [
                { value: "admin", label: "Admin" }, { value: "teacher", label: "Teacher" },
                { value: "student", label: "Student" }, { value: "registrar", label: "Registrar" },
                { value: "department_head", label: "Department head" },
                { value: "academic_coordinator", label: "Academic coordinator" },
              ]},
              { name: "is_active", label: "Active", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
            ], async (v) => { await apiRequest("/dashboard/admin/users", { method: "POST", body: JSON.stringify({ username: v.username, password: v.password, role: v.role, is_active: v.is_active === "1" }) }); await load(); })}>＋ Add user</button>
            <AdminDataTable rows={users} columns={[
              { key: "id", label: "ID" },
              { key: "username", label: "Username", sortable: true },
              { key: "role", label: "Role" },
              { key: "role_names", label: "Roles (id-based)" },
              { key: "is_active", label: "Active", render: (r: any) => r.is_active ? "Yes" : "No" },
              { key: "last_login_at", label: "Last login", render: (r: any) => r.last_login_at ? new Date(r.last_login_at).toLocaleString() : "—" },
            ]} emptyLabel="No users." getRowId={(r: any) => r.id} />
          </>
        )}

        {tab === "roles" && (
          <>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add role", "Create", [
              { name: "role_code", label: "Role code", required: true },
              { name: "role_name", label: "Role name", required: true },
              { name: "description", label: "Description" },
            ], async (v) => { await apiRequest("/dashboard/admin/roles", { method: "POST", body: JSON.stringify({ role_code: v.role_code, role_name: v.role_name, description: v.description }) }); await load(); })}>＋ Add role</button>
            <AdminDataTable rows={roles} columns={[
              { key: "role_id", label: "ID" },
              { key: "role_code", label: "Code", sortable: true },
              { key: "role_name", label: "Name", sortable: true },
              { key: "is_system_role", label: "System", render: (r: any) => r.is_system_role ? "Yes" : "No" },
              { key: "is_active", label: "Active", render: (r: any) => r.is_active ? "Yes" : "No" },
            ]} emptyLabel="No roles." getRowId={(r: any) => r.role_id} />
          </>
        )}

        {tab === "permissions" && (
          <AdminDataTable rows={permissions} columns={[
            { key: "permission_id", label: "ID" },
            { key: "permission_code", label: "Code", sortable: true },
            { key: "resource", label: "Resource", sortable: true },
            { key: "action", label: "Action" },
            { key: "description", label: "Description" },
          ]} emptyLabel="No permissions." getRowId={(r: any) => r.permission_id} />
        )}

        {tab === "map" && (
          <>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Map role↔permission", "Map", [
              { name: "role_id", label: "Role ID", type: "number", required: true },
              { name: "permission_id", label: "Permission ID", type: "number", required: true },
            ], async (v) => { await apiRequest("/dashboard/admin/role-permission-map", { method: "POST", body: JSON.stringify({ role_id: Number(v.role_id), permission_id: Number(v.permission_id) }) }); await load(); })}>＋ Map</button>
            <AdminDataTable rows={mappings} columns={[
              { key: "role_name", label: "Role", sortable: true },
              { key: "permission_code", label: "Permission" },
              { key: "resource", label: "Resource" },
              { key: "action", label: "Action" },
            ]} emptyLabel="No mappings." getRowId={(r: any) => `${r.role_id}-${r.permission_id}`} />
          </>
        )}

        {tab === "userroles" && (
          <>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Assign role to user", "Assign", [
              { name: "user_id", label: "User ID", type: "number", required: true },
              { name: "role_id", label: "Role ID", type: "number", required: true },
              { name: "is_default", label: "Default", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
            ], async (v) => { await apiRequest("/dashboard/admin/user-roles", { method: "POST", body: JSON.stringify({ user_id: Number(v.user_id), role_id: Number(v.role_id), is_default: v.is_default === "1" }) }); await load(); })}>＋ Assign</button>
            <AdminDataTable rows={userRoles} columns={[
              { key: "username", label: "User", sortable: true },
              { key: "role_name", label: "Role" },
              { key: "role_code", label: "Code" },
              { key: "is_default", label: "Default", render: (r: any) => r.is_default ? "Yes" : "No" },
              { key: "is_active", label: "Active", render: (r: any) => r.is_active ? "Yes" : "No" },
              { key: "assigned_at", label: "Assigned" },
            ]} emptyLabel="No assignments." getRowId={(r: any) => r.user_role_id} />
          </>
        )}

        {tab === "sessions" && (
          <AdminDataTable rows={sessions} columns={[
            { key: "session_id", label: "ID" },
            { key: "user_id", label: "User" },
            { key: "ip_address", label: "IP" },
            { key: "login_at", label: "Login" },
            { key: "logout_at", label: "Logout" },
            { key: "revoked_at", label: "Revoked" },
          ]} emptyLabel="No sessions." getRowId={(r: any) => r.session_id} />
        )}
      </div>

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title={modalTitle} submitLabel={modalSubmit} fields={modalFields} onClose={() => setModalOpen(false)} onSubmit={async (v) => { await modalHandler(v); setModalOpen(false); }} />
      )}
    </div>
  );
}