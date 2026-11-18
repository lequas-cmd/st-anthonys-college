import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, BookOpenText, BriefcaseBusiness, LayoutDashboard, LogOut, Megaphone, Settings, Users } from "lucide-react";
import "../../../styles/dashboard/shared.css";
import "../../../styles/dashboard/student.css";
import { apiRequest } from "../../../services/api";
import AdminCrudModal, { CrudField } from "./components/AdminCrudModal";
import SkeletonLoader from "../../../components/SkeletonLoader";
import { AdminDashboardResponse, AdminTab } from "./adminUtils";
import OverviewPage from "./pages/OverviewPage";
import StudentsPage from "./pages/StudentsPage";
import FacultyPage from "./pages/FacultyPage";
import ProgramsPage from "./pages/ProgramsPage";
import AcademicsPage from "./pages/AcademicsPage";
import AttendancePage from "./pages/AttendancePage";
import ExamsPage from "./pages/ExamsPage";
import DocumentsPage from "./pages/DocumentsPage";
import UsersRolesPage from "./pages/UsersRolesPage";
import ReportsPage from "./pages/ReportsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import SettingsPage from "./pages/SettingsPage";

const tabLabels: Record<AdminTab, string> = {
  overview: "Overview",
  students: "Students",
  faculty: "Faculty & staff",
  programs: "Programs",
  academics: "Academics",
  attendance: "Attendance",
  exams: "Exams & Grading",
  documents: "Documents",
  usersroles: "Users & Roles",
  reports: "Reports",
  announcements: "Announcements",
  settings: "Settings",
};

type AdminModalState = {
  title: string;
  submitLabel: string;
  fields: CrudField[];
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("This semester");
  const [summary, setSummary] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<AdminModalState | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const data = await apiRequest<AdminDashboardResponse>("/dashboard/admin");
        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load dashboard data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => { active = false; };
  }, []);

  const openAddModal = (entity: "student" | "teacher" | "program" | "announcement") => {
    const configMap: Record<typeof entity, { title: string; submitLabel: string; fields: CrudField[] }> = {
      student: {
        title: "Add new student",
        submitLabel: "Create student",
        fields: [
          { name: "first_name", label: "First name", placeholder: "Amina", required: true },
          { name: "last_name", label: "Last name", placeholder: "Bekele", required: true },
          { name: "student_number", label: "Student number", placeholder: "ST-2026-001", required: true },
          { name: "program", label: "Program", placeholder: "Computer Science", required: true },
          { name: "enrollment_year", label: "Enrollment year", type: "number", placeholder: "2026", required: true },
          { name: "username", label: "Username", placeholder: "amina.bekele" },
          { name: "password", label: "Password", type: "password", placeholder: "Password123!" },
        ],
      },
      teacher: {
        title: "Add new faculty member",
        submitLabel: "Create teacher",
        fields: [
          { name: "first_name", label: "First name", placeholder: "Daniel", required: true },
          { name: "last_name", label: "Last name", placeholder: "Tadesse", required: true },
          { name: "employee_number", label: "Employee number", placeholder: "TE-1001", required: true },
          { name: "department", label: "Department", placeholder: "Computer Science", required: true },
          { name: "username", label: "Username", placeholder: "daniel.tadesse" },
          { name: "password", label: "Password", type: "password", placeholder: "Password123!" },
        ],
      },
      program: {
        title: "Add new program",
        submitLabel: "Create program",
        fields: [
          { name: "code", label: "Program code", placeholder: "CS-2026", required: true },
          { name: "title", label: "Program title", placeholder: "Computer Science", required: true },
          { name: "department", label: "Department", placeholder: "ICT", required: true },
          { name: "qualification_level", label: "Qualification level", placeholder: "Level I" },
          { name: "duration_years", label: "Duration (years)", type: "number", placeholder: "2" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Short description" },
        ],
      },
      announcement: {
        title: "Add announcement",
        submitLabel: "Create announcement",
        fields: [
          { name: "title", label: "Title", placeholder: "New intake opens", required: true },
          { name: "body", label: "Message", type: "textarea", placeholder: "Write the announcement text", required: true },
          { name: "link_url", label: "Link URL", placeholder: "/announcements" },
          { name: "audience", label: "Audience", placeholder: "students" },
        ],
      },
    };

    const config = configMap[entity];
    setModal({
      title: config.title,
      submitLabel: config.submitLabel,
      fields: config.fields,
      onSubmit: async (values) => {
        if (entity === "student") {
          const newStudent = await apiRequest<{ student: { student_number: string; first_name: string; last_name: string; program: string; enrollment_year: number; status: string } }>("/dashboard/admin/students", {
            method: "POST",
            body: JSON.stringify({
              first_name: values.first_name,
              last_name: values.last_name,
              student_number: values.student_number,
              program: values.program,
              enrollment_year: Number(values.enrollment_year || new Date().getFullYear()),
              username: values.username || undefined,
              password: values.password || undefined,
            }),
          });

          setSummary((current) => {
            if (!current) return current;
            return {
              ...current,
              totals: { ...current.totals, students: current.totals.students + 1 },
              students: [
                {
                  student_number: newStudent.student.student_number,
                  first_name: newStudent.student.first_name,
                  last_name: newStudent.student.last_name,
                  program: newStudent.student.program,
                  enrollment_year: newStudent.student.enrollment_year,
                  status: newStudent.student.status,
                },
                ...current.students,
              ],
            };
          });
        }

        if (entity === "teacher") {
          await apiRequest<{ teacher: { employee_number: string } }>("/dashboard/admin/teachers", {
            method: "POST",
            body: JSON.stringify({
              first_name: values.first_name,
              last_name: values.last_name,
              employee_number: values.employee_number,
              department: values.department,
              username: values.username || undefined,
              password: values.password || undefined,
            }),
          });
        }

        if (entity === "program") {
          await apiRequest<{ program: { id: number; code: string; name: string } }>("/dashboard/admin/programs", {
            method: "POST",
            body: JSON.stringify({
              code: values.code,
              title: values.title,
              department: values.department,
              qualification_level: values.qualification_level || "Level I",
              duration_years: Number(values.duration_years || 2),
              description: values.description || `${values.title} program.`,
            }),
          });
        }

        if (entity === "announcement") {
          setSummary((current) => current ? { ...current, totals: { ...current.totals } } : current);
        }
      },
    });
  };

  const handleDeleteStudent = async (studentNumber: string) => {
    await apiRequest(`/dashboard/admin/students/${encodeURIComponent(studentNumber)}`, { method: "DELETE" });
    setSummary((current) => current ? {
      ...current,
      totals: { ...current.totals, students: Math.max(0, current.totals.students - 1) },
      students: current.students.filter((student) => student.student_number !== studentNumber),
    } : current);
  };

  const handleLogout = () => {
    localStorage.removeItem("collegeAuthToken");
    localStorage.removeItem("collegeUser");
    sessionStorage.removeItem("collegeSessionToken");
    sessionStorage.removeItem("collegeUser");
    navigate("/login", { replace: true });
  };

  const renderPage = () => {
    if (tab === "overview") {
      return <OverviewPage data={summary} loading={loading} />;
    }
    if (tab === "students") {
      return <StudentsPage data={summary} loading={loading} query={query} setQuery={setQuery} onDelete={handleDeleteStudent} />;
    }
    if (tab === "faculty") {
      return <FacultyPage data={summary} loading={loading} />;
    }
    if (tab === "academics") {
      return <AcademicsPage data={summary} loading={loading} />;
    }
    if (tab === "attendance") {
      return <AttendancePage data={summary} loading={loading} />;
    }
    if (tab === "exams") {
      return <ExamsPage data={summary} loading={loading} />;
    }
    if (tab === "documents") {
      return <DocumentsPage data={summary} loading={loading} />;
    }
    if (tab === "usersroles") {
      return <UsersRolesPage data={summary} loading={loading} />;
    }
    if (tab === "programs") {
      return <ProgramsPage data={summary} />;
    }
    if (tab === "reports") {
      return <ReportsPage data={summary} />;
    }
    if (tab === "announcements") {
      return <AnnouncementsPage data={summary} />;
    }
    return <SettingsPage />;
  };

  return (
    <div className="sa-dashboard sa-student">
      <aside className={`sa-sidebar ${isSidebarOpen ? "is-open" : ""}`} aria-expanded={isSidebarOpen} aria-label="Admin sidebar navigation">
        <div className="sa-sidebar-header">
          <div className="sa-brand"><div className="sa-crest">SA</div><div><strong>SAINT ANTHONY'S</strong><span>TECHNICAL COLLEGE</span></div></div>
          <button type="button" className="sa-sidebar-close" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>
        <div className="sa-role">ADMINISTRATION</div>
        <nav className="sa-nav">
          <a className={tab === "overview" ? "active" : ""} href="#overview" onClick={() => { setTab("overview"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><LayoutDashboard size={15} /></span> Overview</a>
          <a className={tab === "students" ? "active" : ""} href="#students" onClick={() => { setTab("students"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><Users size={15} /></span> Students</a>
          <a className={tab === "faculty" ? "active" : ""} href="#faculty" onClick={() => { setTab("faculty"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><BriefcaseBusiness size={15} /></span> Faculty & staff</a>
          <a className={tab === "academics" ? "active" : ""} href="#academics" onClick={() => { setTab("academics"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><BookOpenText size={15} /></span> Academics</a>
          <a className={tab === "attendance" ? "active" : ""} href="#attendance" onClick={() => { setTab("attendance"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><BookOpenText size={15} /></span> Attendance</a>
          <a className={tab === "exams" ? "active" : ""} href="#exams" onClick={() => { setTab("exams"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><BookOpenText size={15} /></span> Exams & Grading</a>
          <a className={tab === "documents" ? "active" : ""} href="#documents" onClick={() => { setTab("documents"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><BookOpenText size={15} /></span> Documents</a>
          <a className={tab === "usersroles" ? "active" : ""} href="#usersroles" onClick={() => { setTab("usersroles"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><Users size={15} /></span> Users & Roles</a>
          <a className={tab === "programs" ? "active" : ""} href="#programs" onClick={() => { setTab("programs"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><BookOpenText size={15} /></span> Programs & classes</a>
          <a className={tab === "reports" ? "active" : ""} href="#reports" onClick={() => { setTab("reports"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><BarChart3 size={15} /></span> Academic reports</a>
          <a className={tab === "announcements" ? "active" : ""} href="#announcements" onClick={() => { setTab("announcements"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><Megaphone size={15} /></span> Announcements</a>
          <a className={tab === "settings" ? "active" : ""} href="#settings" onClick={() => { setTab("settings"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><Settings size={15} /></span> Settings</a>
        </nav>
        <div className="sa-sidebar-logout">
          <button type="button" className="sa-logout-btn" onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
        <div className="sa-sidebar-bottom"><div className="sa-help-icon">?</div><div><strong>System support</strong><span>Administration help desk</span></div><span className="sa-chevron">›</span></div>
      </aside>

      <main className="sa-main">
        <header className="sa-topbar">
          <button type="button" className="sa-mobile-menu-toggle" aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"} aria-expanded={isSidebarOpen} onClick={() => setIsSidebarOpen((open) => !open)}>☰</button>
          <div className="sa-breadcrumb">Administration <span>/</span> {tabLabels[tab]}</div>
        </header>

        <section className="sa-content">
          {error && <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>}

          <div className="sa-page-heading">
            <div>
              <div className="sa-eyebrow">INSTITUTIONAL OVERSIGHT</div>
              <h1>{tabLabels[tab]}</h1>
              <p>A consolidated view of academic operations and student services.</p>
            </div>


          </div>

          {loading ? <SkeletonLoader /> : renderPage()}
        </section>
      </main>

      {modal && (
        <AdminCrudModal
          open={!!modal}
          title={modal.title}
          submitLabel={modal.submitLabel}
          fields={modal.fields}
          onClose={() => setModal(null)}
          onSubmit={async (values) => {
            await modal.onSubmit(values);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
