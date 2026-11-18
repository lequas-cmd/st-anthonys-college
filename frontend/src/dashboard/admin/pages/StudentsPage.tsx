import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable, { Column } from "../components/AdminDataTable";
import AdminCrudModal, { CrudField } from "../components/AdminCrudModal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

type Student = {
  id: number;
  studentNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  name: string;
  program: string;
  programId: number | null;
  departmentName: string | null;
  enrollmentYear: number | null;
  classGroupId: number | null;
  classGroupName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: string;
};

type Profile = {
  student: Student;
  academicEnrollments: Array<{
    id: number;
    programName: string | null;
    academicYearName: string | null;
    classGroupName: string | null;
    levelNumber: number;
    enrollmentStatus: string;
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
  }>;
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "graduated", label: "Graduated" },
  { value: "suspended", label: "Suspended" },
  { value: "withdrawn", label: "Withdrawn" },
];

const addFields: CrudField[] = [
  { name: "first_name", label: "First name", required: true },
  { name: "middle_name", label: "Middle name" },
  { name: "last_name", label: "Last name", required: true },
  { name: "student_number", label: "Student number", required: true },
  { name: "program_id", label: "Program ID", type: "number" },
  { name: "program", label: "Program (text fallback)" },
  { name: "enrollment_year", label: "Enrollment year", type: "number" },
  { name: "class_group_id", label: "Class group ID", type: "number" },
  { name: "date_of_birth", label: "Date of birth", type: "date" },
  { name: "gender", label: "Gender", type: "select", options: [
    { value: "female", label: "Female" }, { value: "male", label: "Male" },
    { value: "other", label: "Other" }, { value: "undisclosed", label: "Undisclosed" },
  ]},
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
];

export default function StudentsPage({ data, loading: parentLoading, query, setQuery, onDelete }: {
  data: any; loading: boolean; query: string; setQuery: (v: string) => void; onDelete: (sn: string) => void;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [modalFields, setModalFields] = useState<CrudField[]>(addFields);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [dupMsg, setDupMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "200");
      const res = await apiRequest<{ students: any[]; total: number }>(`/dashboard/admin/students?${params.toString()}`);
      setStudents(res.students.map((s) => ({
        id: s.id, studentNumber: s.studentNumber, firstName: s.firstName, middleName: s.middleName,
        lastName: s.lastName, name: s.name, program: s.program, programId: s.programId,
        departmentName: s.departmentName, enrollmentYear: s.enrollmentYear, classGroupId: s.classGroupId,
        classGroupName: s.classGroupName, dateOfBirth: s.dateOfBirth, gender: s.gender, phone: s.phone,
        email: s.email, address: s.address, status: s.status,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [query, statusFilter]);

  const openAdd = () => {
    setEditing(null);
    setDupMsg(null);
    setModalFields(addFields.map((f) => ({ ...f, defaultValue: f.name === "status" ? "active" : f.defaultValue })));
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setDupMsg(null);
    const fields = addFields.map((f) => {
      const valMap: Record<string, any> = {
        first_name: s.firstName, middle_name: s.middleName ?? "", last_name: s.lastName,
        student_number: s.studentNumber, program_id: s.programId ?? "", program: s.program,
        enrollment_year: s.enrollmentYear ?? "", class_group_id: s.classGroupId ?? "",
        date_of_birth: s.dateOfBirth ?? "", gender: s.gender ?? "", phone: s.phone ?? "",
        email: s.email ?? "", address: s.address ?? "", status: s.status,
      };
      return { ...f, defaultValue: valMap[f.name] ?? f.defaultValue };
    });
    setModalFields(fields);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    setDupMsg(null);
    const body: any = {
      first_name: values.first_name,
      middle_name: values.middle_name || null,
      last_name: values.last_name,
      student_number: values.student_number,
      program: values.program || undefined,
      program_id: values.program_id ? Number(values.program_id) : undefined,
      enrollment_year: values.enrollment_year ? Number(values.enrollment_year) : undefined,
      class_group_id: values.class_group_id ? Number(values.class_group_id) : undefined,
      date_of_birth: values.date_of_birth || undefined,
      gender: values.gender || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
      status: values.status || undefined,
    };
    try {
      if (editing) {
        await apiRequest(`/dashboard/admin/students/${encodeURIComponent(editing.studentNumber)}`, {
          method: "PUT", body: JSON.stringify(body),
        });
      } else {
        await apiRequest(`/dashboard/admin/students`, { method: "POST", body: JSON.stringify(body) });
      }
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed.";
      if (msg.toLowerCase().includes("duplicate")) setDupMsg(msg);
      throw err;
    }
  };

  const openProfile = async (s: Student) => {
    setProfile(null);
    setProfileOpen(true);
    try {
      const res = await apiRequest<Profile>(`/dashboard/admin/students/${encodeURIComponent(s.studentNumber)}`);
      setProfile(res);
    } catch (err) {
      setProfile(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await apiRequest(`/dashboard/admin/students/${encodeURIComponent(toDelete)}`, { method: "DELETE" });
    setConfirmOpen(false);
    setToDelete(null);
    await load();
    onDelete(toDelete);
  };

  const handleStatusChange = async (sn: string, status: string) => {
    await apiRequest(`/dashboard/admin/students/${encodeURIComponent(sn)}/status`, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
    await load();
  };

  const handleImport = async (values: Record<string, string>) => {
    const res = await apiRequest<any>("/dashboard/admin/students/import", {
      method: "POST", body: JSON.stringify({ csv: values.csv, source_file: values.source_file || "import.csv" }),
    });
    setImportResult(res);
    await load();
  };

  const columns: Column<Student>[] = [
    {
      key: "name", label: "Student", sortable: true,
      render: (row) => (
        <div className="sa-admin-student">
          <strong>{row.name}</strong>
          <small>{row.studentNumber}</small>
        </div>
      ),
    },
    { key: "departmentName", label: "Department", sortable: true, render: (row) => row.departmentName || "—" },
    { key: "program", label: "Program", sortable: true },
    { key: "enrollmentYear", label: "Year", sortable: true, render: (row) => row.enrollmentYear ?? "—" },
    {
      key: "status", label: "Status", sortable: true,
      render: (row) => <StatusBadge label={row.status} tone={row.status === "active" ? "success" : row.status === "suspended" ? "warning" : "info"} />,
    },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <span className="sa-inline-actions">
          <button type="button" className="sa-button sa-button-outline" onClick={() => openProfile(row)}>Profile</button>
          <button type="button" className="sa-button sa-button-outline" onClick={() => openEdit(row)}>Edit</button>
          <select
            className="sa-select"
            value={row.status}
            onChange={(e) => handleStatusChange(row.studentNumber, e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete(row.studentNumber); setConfirmOpen(true); }}>Delete</button>
        </span>
      ),
    },
  ];

  if (loading || parentLoading) return <LoadingState message="Loading students…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div>
            <h3>Student registry</h3>
            <p>{students.length} profiles</p>
          </div>
        </div>
        <div className="sa-grade-actions">
          <label className="sa-search sa-admin-search">
            ⌕ <input aria-label="Search students" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, ID, email, phone" />
          </label>
          <select className="sa-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="button" className="sa-button sa-button-primary" onClick={openAdd}>＋ Add student</button>
          <button type="button" className="sa-button sa-button-outline" onClick={() => { setImportResult(null); setImportOpen(true); }}>Import CSV</button>
        </div>
        {students.length === 0 ? (
          <EmptyState message="No student records matching your filters." />
        ) : (
          <AdminDataTable rows={students} columns={columns} emptyLabel="No student records." getRowId={(r) => r.id} selectable />
        )}
      </div>

      {modalOpen && (
        <AdminCrudModal
          open={modalOpen}
          title={editing ? "Edit student" : "Add student"}
          submitLabel={editing ? "Save changes" : "Create student"}
          fields={modalFields}
          onClose={() => setModalOpen(false)}
          onSubmit={async (values) => {
            await handleSubmit(values);
            setModalOpen(false);
          }}
        />
      )}
      {dupMsg ? <ErrorState message={dupMsg} /> : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete student"
        message="This will permanently delete the student record and user account."
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
      />

      {profileOpen && (
        <div className="sa-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setProfileOpen(false)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <div className="sa-eyebrow">STUDENT PROFILE</div>
                <h3>{profile?.student?.name ?? "Loading…"}</h3>
              </div>
              <button type="button" className="sa-link-button" onClick={() => setProfileOpen(false)}>Close ✕</button>
            </div>
            <div className="sa-modal-form">
              {!profile ? <p>Loading profile…</p> : (
                <>
                  <p><strong>Number:</strong> {profile.student.studentNumber}</p>
                  <p><strong>Department:</strong> {profile.student.departmentName || "—"}</p>
                  <p><strong>Program:</strong> {profile.student.program}</p>
                  <p><strong>Year:</strong> {profile.student.enrollmentYear ?? "—"}</p>
                  <p><strong>Status:</strong> {profile.student.status}</p>
                  <p><strong>Email:</strong> {profile.student.email || "—"}</p>
                  <p><strong>Phone:</strong> {profile.student.phone || "—"}</p>
                  <h4>Academic enrollments</h4>
                  {profile.academicEnrollments.length === 0 ? <p>None recorded.</p> : (
                    <ul>
                      {profile.academicEnrollments.map((e) => (
                        <li key={e.id}>{e.programName} · {e.academicYearName} · Level {e.levelNumber} · {e.enrollmentStatus}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {importOpen && (
        <AdminCrudModal
          open={importOpen}
          title="Import students (CSV)"
          submitLabel="Import"
          fields={[
            { name: "source_file", label: "Source file name", defaultValue: "students.csv" },
            { name: "csv", label: "CSV content", type: "textarea", required: true, placeholder: "first_name,last_name,student_number,program,enrollment_year,email,phone,date_of_birth" },
          ]}
          onClose={() => setImportOpen(false)}
          onSubmit={async (values) => {
            await handleImport(values);
            setImportOpen(false);
          }}
        />
      )}
      {importResult ? <EmptyState title="Import result" message={`Inserted ${importResult.inserted} of ${importResult.total}. Errors: ${importResult.errors}.`} /> : null}
    </div>
  );
}