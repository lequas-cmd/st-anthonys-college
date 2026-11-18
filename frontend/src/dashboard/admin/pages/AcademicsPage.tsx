import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import AdminDataTable, { Column } from "../components/AdminDataTable";
import AdminCrudModal, { CrudField } from "../components/AdminCrudModal";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

type Tab = "departments" | "programs" | "courses" | "offerings" | "rooms" | "timetable" | "calendar" | "enrollments";

export default function AcademicsPage({ data, loading: parentLoading }: { data: any; loading: boolean }) {
  const [tab, setTab] = useState<Tab>("departments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubmit, setModalSubmit] = useState("Save");
  const [modalFields, setModalFields] = useState<CrudField[]>([]);
  const [modalHandler, setModalHandler] = useState<(v: Record<string, string>) => Promise<void>>(async () => {});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ kind: string; id: any } | null>(null);

  const loadAll = async () => {
    setLoading(true); setError(null);
    try {
      const [d, p, c, o, r, t, cal, ay, sem, en, st] = await Promise.all([
        apiRequest<any>("/dashboard/admin/departments"),
        apiRequest<any>("/programs"),
        apiRequest<any>("/dashboard/admin/courses"),
        apiRequest<any>("/dashboard/admin/offerings"),
        apiRequest<any>("/dashboard/admin/rooms"),
        apiRequest<any>("/dashboard/admin/timetable"),
        apiRequest<any>("/dashboard/admin/calendar-events"),
        apiRequest<any>("/dashboard/admin/academic-years"),
        apiRequest<any>("/dashboard/admin/semesters"),
        apiRequest<any>("/dashboard/admin/enrollments"),
        apiRequest<any>("/dashboard/admin/students?limit=200"),
      ]);
      setDepartments(d.departments || []);
      setPrograms((p.programs || []).map((x: any) => ({ id: x.id, code: x.code, name: x.title, department: x.category, qualification_level: x.qualification_level, duration_years: x.duration_years, is_active: x.is_active })));
      // also fetch raw programs for dropdowns via admin? use public list enough
      setCourses(c.courses || []);
      setOfferings(o.offerings || []);
      setRooms(r.rooms || []);
      setTimetable(t.entries || []);
      setCalendar(cal.events || []);
      setAcademicYears(ay.academicYears || []);
      setSemesters(sem.semesters || []);
      setEnrollments(en.enrollments || []);
      setStudents(st.students || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load academics."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const openModal = (title: string, submit: string, fields: CrudField[], handler: (v: Record<string, string>) => Promise<void>) => {
    setModalTitle(title); setModalSubmit(submit); setModalFields(fields); setModalHandler(() => handler); setModalOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    const { kind, id } = toDelete;
    const pathMap: Record<string, string> = {
      department: `/dashboard/admin/departments/${id}`,
      course: `/dashboard/admin/courses/${id}`,
      offering: `/dashboard/admin/offerings/${id}`,
      room: `/dashboard/admin/rooms/${id}`,
      timetable: `/dashboard/admin/timetable/${id}`,
      calendar: `/dashboard/admin/calendar-events/${id}`,
      enrollment: `/dashboard/admin/enrollments/${id}`,
    };
    await apiRequest(pathMap[kind], { method: "DELETE" });
    setConfirmOpen(false); setToDelete(null); await loadAll();
  };

  if (loading || parentLoading) return <LoadingState message="Loading academics…" />;
  if (error) return <ErrorState message={error} />;

  const tabs: { key: Tab; label: string }[] = [
    { key: "departments", label: "Departments" },
    { key: "programs", label: "Programs" },
    { key: "courses", label: "Courses" },
    { key: "offerings", label: "Class offerings" },
    { key: "rooms", label: "Rooms / Labs" },
    { key: "timetable", label: "Timetable" },
    { key: "calendar", label: "Academic calendar" },
    { key: "enrollments", label: "Manual enrollment" },
  ];

  return (
    <div className="sa-st-report">
      <div className="sa-panel">
        <div className="sa-panel-heading">
          <div><h3>Academics</h3><p>Departments, programs, courses, timetable, calendar, enrollment</p></div>
        </div>
        <div className="sa-inline-actions">
          {tabs.map((t) => (
            <button key={t.key} type="button" className={`sa-button ${tab === t.key ? "sa-button-primary" : "sa-button-outline"}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab === "departments" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Departments</h3><p>{departments.length} records</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add department", "Create", [
              { name: "name", label: "Name", required: true },
              { name: "code", label: "Code", required: true },
              { name: "head_staff_id", label: "Head staff ID", type: "number" },
            ], async (v) => { await apiRequest("/dashboard/admin/departments", { method: "POST", body: JSON.stringify({ name: v.name, code: v.code, head_staff_id: v.head_staff_id ? Number(v.head_staff_id) : null }) }); await loadAll(); })}>＋ Add</button>
          </div>
          <AdminDataTable rows={departments} columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "code", label: "Code", sortable: true },
            { key: "department_id", label: "ID" },
            { key: "actions", label: "Actions", render: (r: any) => (<button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete({ kind: "department", id: r.department_id }); setConfirmOpen(true); }}>Delete</button>) },
          ]} emptyLabel="No departments." getRowId={(r: any) => r.department_id} />
        </div>
      )}

      {tab === "programs" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Programs</h3><p>{programs.length} records</p></div>
          </div>
          <AdminDataTable rows={programs} columns={[
            { key: "code", label: "Code", sortable: true },
            { key: "name", label: "Name", sortable: true },
            { key: "department", label: "Department" },
            { key: "qualification_level", label: "Level" },
            { key: "duration_years", label: "Years" },
          ]} emptyLabel="No programs." getRowId={(r: any) => r.id} />
          <p>Programs admin CRUD exists at /dashboard/admin/programs (add via Faculty/Programs). Listing from public programs endpoint.</p>
        </div>
      )}

      {tab === "courses" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Courses</h3><p>{courses.length} records</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add course", "Create", [
              { name: "code", label: "Code", required: true },
              { name: "title", label: "Title", required: true },
              { name: "description", label: "Description", type: "textarea" },
              { name: "credit_hours", label: "Credit hours", type: "number" },
              { name: "program_id", label: "Program ID", type: "number" },
              { name: "level_number", label: "Level", type: "number" },
            ], async (v) => { await apiRequest("/dashboard/admin/courses", { method: "POST", body: JSON.stringify({ code: v.code, title: v.title, description: v.description, credit_hours: v.credit_hours ? Number(v.credit_hours) : 3, program_id: v.program_id ? Number(v.program_id) : null, level_number: v.level_number ? Number(v.level_number) : 1 }) }); await loadAll(); })}>＋ Add</button>
          </div>
          <AdminDataTable rows={courses} columns={[
            { key: "code", label: "Code", sortable: true },
            { key: "title", label: "Title", sortable: true },
            { key: "credit_hours", label: "Credits" },
            { key: "level_number", label: "Level" },
            { key: "is_active", label: "Active", render: (r: any) => r.is_active ? "Yes" : "No" },
            { key: "actions", label: "Actions", render: (r: any) => (<button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete({ kind: "course", id: r.id }); setConfirmOpen(true); }}>Delete</button>) },
          ]} emptyLabel="No courses." getRowId={(r: any) => r.id} />
        </div>
      )}

      {tab === "offerings" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Class offerings</h3><p>{offerings.length} records</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add offering", "Create", [
              { name: "course_id", label: "Course ID", type: "number", required: true },
              { name: "teacher_id", label: "Teacher ID", type: "number", required: true },
              { name: "semester_id", label: "Semester ID", type: "number", required: true },
              { name: "section", label: "Section" },
              { name: "room", label: "Room (text)" },
              { name: "room_id", label: "Room ID", type: "number" },
              { name: "capacity", label: "Capacity", type: "number" },
              { name: "status", label: "Status", type: "select", options: [
                { value: "planned", label: "Planned" }, { value: "open", label: "Open" },
                { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" },
              ]},
              { name: "lab_required", label: "Lab required", type: "select", options: [{ value: "0", label: "No" }, { value: "1", label: "Yes" }] },
            ], async (v) => { await apiRequest("/dashboard/admin/offerings", { method: "POST", body: JSON.stringify({ course_id: Number(v.course_id), teacher_id: Number(v.teacher_id), semester_id: Number(v.semester_id), section: v.section, room: v.room, room_id: v.room_id ? Number(v.room_id) : null, capacity: v.capacity ? Number(v.capacity) : 40, status: v.status, lab_required: v.lab_required === "1" }) }); await loadAll(); })}>＋ Add</button>
          </div>
          <AdminDataTable rows={offerings} columns={[
            { key: "course_code", label: "Course", sortable: true },
            { key: "course_title", label: "Title" },
            { key: "teacher_first", label: "Teacher", render: (r: any) => r.teacher_first ? `${r.teacher_first} ${r.teacher_last}` : "—" },
            { key: "semester_name", label: "Semester" },
            { key: "section", label: "Section" },
            { key: "room", label: "Room", render: (r: any) => r.room_name || r.room || "—" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions", render: (r: any) => (<button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete({ kind: "offering", id: r.id }); setConfirmOpen(true); }}>Delete</button>) },
          ]} emptyLabel="No offerings." getRowId={(r: any) => r.id} />
        </div>
      )}

      {tab === "rooms" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Rooms / Labs</h3><p>{rooms.length} records</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add room", "Create", [
              { name: "room_code", label: "Room code", required: true },
              { name: "room_name", label: "Room name", required: true },
              { name: "room_type", label: "Type", type: "select", options: [
                { value: "classroom", label: "Classroom" }, { value: "workshop", label: "Workshop" },
                { value: "laboratory", label: "Laboratory" }, { value: "office", label: "Office" },
                { value: "hall", label: "Hall" }, { value: "library", label: "Library" }, { value: "other", label: "Other" },
              ]},
              { name: "building", label: "Building" },
              { name: "floor_label", label: "Floor" },
              { name: "capacity", label: "Capacity", type: "number" },
              { name: "status", label: "Status", type: "select", options: [
                { value: "available", label: "Available" }, { value: "unavailable", label: "Unavailable" }, { value: "maintenance", label: "Maintenance" },
              ]},
              { name: "notes", label: "Notes", type: "textarea" },
            ], async (v) => { await apiRequest("/dashboard/admin/rooms", { method: "POST", body: JSON.stringify({ room_code: v.room_code, room_name: v.room_name, room_type: v.room_type, building: v.building, floor_label: v.floor_label, capacity: v.capacity ? Number(v.capacity) : null, status: v.status, notes: v.notes }) }); await loadAll(); })}>＋ Add</button>
          </div>
          <AdminDataTable rows={rooms} columns={[
            { key: "room_code", label: "Code", sortable: true },
            { key: "room_name", label: "Name", sortable: true },
            { key: "room_type", label: "Type" },
            { key: "building", label: "Building" },
            { key: "capacity", label: "Capacity" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions", render: (r: any) => (<button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete({ kind: "room", id: r.room_id }); setConfirmOpen(true); }}>Delete</button>) },
          ]} emptyLabel="No rooms." getRowId={(r: any) => r.room_id} />
        </div>
      )}

      {tab === "timetable" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Timetable entries</h3><p>{timetable.length} slots</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add timetable slot", "Create", [
              { name: "offering_id", label: "Offering ID", type: "number", required: true },
              { name: "weekday", label: "Weekday (1-7)", type: "number", required: true },
              { name: "starts_at", label: "Starts (HH:MM:SS)", required: true },
              { name: "ends_at", label: "Ends (HH:MM:SS)", required: true },
              { name: "room", label: "Room (text)" },
              { name: "room_id", label: "Room ID", type: "number" },
              { name: "schedule_status", label: "Status", type: "select", options: [
                { value: "active", label: "Active" }, { value: "cancelled", label: "Cancelled" }, { value: "superseded", label: "Superseded" },
              ]},
            ], async (v) => { await apiRequest("/dashboard/admin/timetable", { method: "POST", body: JSON.stringify({ offering_id: Number(v.offering_id), weekday: Number(v.weekday), starts_at: v.starts_at, ends_at: v.ends_at, room: v.room, room_id: v.room_id ? Number(v.room_id) : null, schedule_status: v.schedule_status }) }); await loadAll(); })}>＋ Add</button>
          </div>
          <AdminDataTable rows={timetable} columns={[
            { key: "offering_id", label: "Offering" },
            { key: "weekday", label: "Day" },
            { key: "starts_at", label: "Start" },
            { key: "ends_at", label: "End" },
            { key: "room", label: "Room", render: (r: any) => r.room_name || r.room || "—" },
            { key: "schedule_status", label: "Status" },
            { key: "actions", label: "Actions", render: (r: any) => (<button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete({ kind: "timetable", id: r.id }); setConfirmOpen(true); }}>Delete</button>) },
          ]} emptyLabel="No timetable entries." getRowId={(r: any) => r.id} />
        </div>
      )}

      {tab === "calendar" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Academic calendar events</h3><p>{calendar.length} events</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Add calendar event", "Create", [
              { name: "title", label: "Title", required: true },
              { name: "event_type", label: "Type", required: true },
              { name: "starts_at", label: "Starts at", required: true },
              { name: "ends_at", label: "Ends at", required: true },
              { name: "location", label: "Location" },
            ], async (v) => { await apiRequest("/dashboard/admin/calendar-events", { method: "POST", body: JSON.stringify({ title: v.title, event_type: v.event_type, starts_at: v.starts_at, ends_at: v.ends_at, location: v.location }) }); await loadAll(); })}>＋ Add</button>
          </div>
          <AdminDataTable rows={calendar} columns={[
            { key: "title", label: "Title", sortable: true },
            { key: "event_type", label: "Type" },
            { key: "starts_at", label: "Starts" },
            { key: "ends_at", label: "Ends" },
            { key: "location", label: "Location" },
            { key: "actions", label: "Actions", render: (r: any) => (<button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete({ kind: "calendar", id: r.event_id }); setConfirmOpen(true); }}>Delete</button>) },
          ]} emptyLabel="No events." getRowId={(r: any) => r.event_id} />
        </div>
      )}

      {tab === "enrollments" && (
        <div className="sa-panel">
          <div className="sa-panel-heading">
            <div><h3>Manual enrollment</h3><p>{enrollments.length} enrollments</p></div>
            <button type="button" className="sa-button sa-button-primary" onClick={() => openModal("Enroll student", "Enroll", [
              { name: "student_id", label: "Student ID", type: "number", required: true },
              { name: "offering_id", label: "Offering ID", type: "number", required: true },
              { name: "status", label: "Status", type: "select", options: [
                { value: "enrolled", label: "Enrolled" }, { value: "completed", label: "Completed" }, { value: "withdrawn", label: "Withdrawn" },
              ]},
            ], async (v) => { await apiRequest("/dashboard/admin/enrollments", { method: "POST", body: JSON.stringify({ student_id: Number(v.student_id), offering_id: Number(v.offering_id), status: v.status }) }); await loadAll(); })}>＋ Enroll</button>
          </div>
          <p>Students (id=name): {students.map((s) => `${s.id}=${s.name}`).join(", ").slice(0, 300)}</p>
          <AdminDataTable rows={enrollments} columns={[
            { key: "student_number", label: "Student", sortable: true },
            { key: "first_name", label: "Name", render: (r: any) => `${r.first_name} ${r.last_name}` },
            { key: "course_code", label: "Course", sortable: true },
            { key: "course_title", label: "Title" },
            { key: "section", label: "Section" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions", render: (r: any) => (<button type="button" className="sa-button sa-button-outline" onClick={() => { setToDelete({ kind: "enrollment", id: r.id }); setConfirmOpen(true); }}>Remove</button>) },
          ]} emptyLabel="No enrollments." getRowId={(r: any) => r.id} />
        </div>
      )}

      {modalOpen && (
        <AdminCrudModal open={modalOpen} title={modalTitle} submitLabel={modalSubmit} fields={modalFields} onClose={() => setModalOpen(false)} onSubmit={async (v) => { await modalHandler(v); setModalOpen(false); }} />
      )}
      <ConfirmDialog open={confirmOpen} title="Delete record" message="This action cannot be undone." onConfirm={doDelete} onCancel={() => { setConfirmOpen(false); setToDelete(null); }} />
    </div>
  );
}