import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable, { Column } from "../components/AdminDataTable";
import AdminCrudModal, { CrudField } from "../components/AdminCrudModal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

type Staff = {
  id: number; userId: number; employeeNumber: string; firstName: string; lastName: string; name: string;
  department: string; departmentId: number | null; phone: string | null; email: string | null;
  hireDate: string | null; status: string;
};

type Profile = {
  staff: Staff;
  qualifications: Array<{ id: number; qualification: string; fieldOfStudy: string | null; institution: string | null; yearCompleted: number | null }>;
  assignments: Array<{ id: number; courseCode: string; courseTitle: string; section: string; semester: string; role: string; isActive: boolean }>;
  leaveRequests: Array<{ id: number; leaveType: string; startDate: string; endDate: string; status: string; reason: string | null }>;
  attendance: Array<{ id: number; date: string; status: string; checkIn: string | null; checkOut: string | null; remarks: string | null }>;
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On leave" },
];

const addFields: CrudField[] = [
  { name: "first_name", label: "First name", required: true },
  { name: "last_name", label: "Last name", required: true },
  { name: "employee_number", label: "Employee number", required: true },
  { name: "department", label: "Department" },
  { name: "department_id", label: "Department ID", type: "number" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" },
  { name: "hire_date", label: "Hire date", type: "date" },
  { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
];

export default function StaffPage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [modalFields, setModalFields] = useState<CrudField[]>(addFields);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "200");
      const res = await apiRequest<{ staff: any[]; total: number }>(`/dashboard/admin/staff?${params.toString()}`);
      setStaff(res.staff.map((s) => ({
        id: s.id, userId: s.userId, employeeNumber: s.employeeNumber, firstName: s.firstName,
        lastName: s.lastName, name: s.name, department: s.department, departmentId: s.departmentId,
        phone: s.phone, email: s.email, hireDate: s.hireDate, status: s.status,
      })));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load staff."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [query, statusFilter]);
  useEffect(() => {
    apiRequest<{ leaveTypes: any[] }>("/dashboard/admin/staff/leave-types").then((r) => setLeaveTypes(r.leaveTypes)).catch(() => {});
  }, []);

  const openAdd = () => {
    setEditing(null);
    setModalFields(addFields.map((f) => ({ ...f, defaultValue: f.name === "status" ? "active" : f.defaultValue })));
    setModalOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    const valMap: Record<string, any> = {
      first_name: s.firstName, last_name: s.lastName, employee_number: s.employeeNumber,
      department: s.department, department_id: s.departmentId ?? "", phone: s.phone ?? "",
      email: s.email ?? "", hire_date: s.hireDate ?? "", status: s.status,
    };
    setModalFields(addFields.map((f) => ({ ...f, defaultValue: valMap[f.name] ?? f.defaultValue })));
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    const body: any = {
      first_name: values.first_name, last_name: values.last_name, employee_number: values.employee_number,
      department: values.department || undefined, department_id: values.department_id ? Number(values.department_id) : undefined,
      phone: values.phone || undefined, email: values.email || undefined, hire_date: values.hire_date || undefined,
      status: values.status || undefined,
    };
    if (editing) {
      await apiRequest(`/dashboard/admin/staff/${encodeURIComponent(editing.employeeNumber)}`, { method: "PUT", body: JSON.stringify(body) });
    } else {
      await apiRequest(`/dashboard/admin/staff`, { method: "POST", body: JSON.stringify({ ...body, password: values.password }) });
    }
    await load();
  };

  const openProfile = async (s: Staff) => {
    setProfile(null); setProfileOpen(true);
    try {
      const res = await apiRequest<Profile>(`/dashboard/admin/staff/${encodeURIComponent(s.employeeNumber)}`);
      setProfile(res);
    } catch { setProfile(null); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await apiRequest(`/dashboard/admin/staff/${encodeURIComponent(toDelete)}`, { method: "DELETE" });
    setConfirmOpen(false); setToDelete(null); await load();
  };

  const handleStatusChange = async (en: string, status: string) => {
    await apiRequest(`/dashboard/admin/staff/${encodeURIComponent(en)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    await load();
  };

  const handleLeaveRequest = async (employeeNumber: string, leaveType: string, start: string, end: string, reason: string) => {
    await apiRequest(`/dashboard/admin/staff/${encodeURIComponent(employeeNumber)}/leave`, {
      method: "POST", body: JSON.stringify({ leave_type: leaveType, start_date: start, end_date: end, reason }),
    });
    await openProfile(staff.find((s) => s.employeeNumber === employeeNumber)!);
  };

  const handleAttendance = async (employeeNumber: string, date: string, status: string) => {
    await apiRequest(`/dashboard/admin/staff/${encodeURIComponent(employeeNumber)}/attendance`, {
      method: "POST", body: JSON.stringify({ attendance_date: date, status }),
    });
    await openProfile(staff.find((s) => s.employeeNumber === employeeNumber)!);
  };

  const handleLeaveReview = async (leaveId: number, status: string) => {
    await apiRequest(`/dashboard/admin/staff/leave/${leaveId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (profile) await openProfile(profile.staff);
  };

  const columns: Column<Staff>[] = [
    {
      key: "name", label: "Staff", sortable: true,
      render: (row) => (<div className="sa-admin-student"><strong>{row.name}</strong><small>{row.employeeNumber}</small></div>),
    },
    { key: "department", label: "Department", sortable: true },
    { key: "email", label: "Email", render: (row) => row.email || "—" },
    { key: "phone", label: "Phone", render: (row) => row.phone || "—" },
    { key: "hireDate", label: "Hire date", render: (row) => row.hireDate ? new Date(row.hireDate).toLocaleDateString() : "—" },
    {
      key: "status", label: "Status", sortable: true,
      render: (row) => <StatusBadge label={row.status} tone={row.status === "active" ? "success" : row.status === "on_leave" ? "warning" : "info"} />,
    },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <span className="sa-inline-actions">
          <button type="button" className="sa-button sa-button-outline" onClick={() => openProfile(row)}>Profile</button>
          <button type="button" className="sa-button sa-button-outline" onClick={() => openEdit(row)}>Edit</button>
          <select className="sa-select" value={row.status} onChange={(e) => handleStatusChange(row.employeeNumber, e.target.value)}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete(row.employeeNumber); setConfirmOpen(true); }}>Delete</button>
        </span>
      ),
    },
  ];

  if (loading || parentLoading) return <LoadingState message="Loading staff…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Staff directory</h3><p>{staff.length} profiles</p></div>
        </div>
        <div className="sa-grade-actions">
          <label className="sa-search sa-admin-search">
            ⌕ <input aria-label="Search staff" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, ID, email, phone" />
          </label>
          <select className="sa-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="button" className="sa-button sa-button-primary" onClick={openAdd}>＋ Add staff</button>
        </div>
        {staff.length === 0 ? <EmptyState message="No staff records." /> : (
          <AdminDataTable rows={staff} columns={columns} emptyLabel="No staff records." getRowId={(r) => r.id} selectable />
        )}
      </div>

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title={editing ? "Edit staff" : "Add staff"} submitLabel={editing ? "Save changes" : "Create staff"} fields={modalFields} onClose={() => setModalOpen(false)} onSubmit={async (v) => { await handleSubmit(v); setModalOpen(false); }} />
      )}

      <ConfirmDialog open={confirmOpen} title="Delete staff" message="This will permanently delete the staff record and user account." onConfirm={handleDelete} onCancel={() => { setConfirmOpen(false); setToDelete(null); }} />

      {profileOpen && (
        <div className="sa-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setProfileOpen(false)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div><div className="sa-eyebrow">STAFF PROFILE</div><h3>{profile?.staff?.name ?? "Loading…"}</h3></div>
              <button type="button" className="sa-link-button" onClick={() => setProfileOpen(false)}>Close ✕</button>
            </div>
            <div className="sa-modal-form">
              {!profile ? <p>Loading…</p> : (
                <>
                  <p><strong>Employee #:</strong> {profile.staff.employeeNumber}</p>
                  <p><strong>Department:</strong> {profile.staff.department}</p>
                  <p><strong>Status:</strong> {profile.staff.status}</p>
                  <p><strong>Email:</strong> {profile.staff.email || "—"}</p>
                  <p><strong>Phone:</strong> {profile.staff.phone || "—"}</p>
                  <h4>Qualifications</h4>
                  {profile.qualifications.length === 0 ? <p>None.</p> : <ul>{profile.qualifications.map((q) => <li key={q.id}>{q.qualification} — {q.institution || "—"} {q.yearCompleted ? `(${q.yearCompleted})` : ""}</li>)}</ul>}
                  <h4>Course assignments</h4>
                  {profile.assignments.length === 0 ? <p>None.</p> : <ul>{profile.assignments.map((a) => <li key={a.id}>{a.courseCode} {a.courseTitle} · {a.semester} · {a.role}{a.isActive ? "" : " (inactive)"}</li>)}</ul>}
                  <h4>Leave requests</h4>
                  {profile.leaveRequests.length === 0 ? <p>None.</p> : (
                    <ul>
                      {profile.leaveRequests.map((l) => (
                        <li key={l.id}>
                          {l.leaveType}: {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()} — {l.status}
                          {l.status === "pending" ? (
                            <span className="sa-inline-actions">
                              <button type="button" className="sa-button sa-button-outline" onClick={() => handleLeaveReview(l.id, "approved")}>Approve</button>
                              <button type="button" className="sa-button sa-button-outline" onClick={() => handleLeaveReview(l.id, "rejected")}>Reject</button>
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                  <h4>Attendance (recent)</h4>
                  {profile.attendance.length === 0 ? <p>None.</p> : <ul>{profile.attendance.map((a) => <li key={a.id}>{new Date(a.date).toLocaleDateString()} — {a.status}{a.checkIn ? ` (${a.checkIn}–${a.checkOut ?? ""})` : ""}</li>)}</ul>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}