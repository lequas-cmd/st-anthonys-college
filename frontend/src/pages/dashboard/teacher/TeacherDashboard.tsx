import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpenText,
  CalendarDays,
  ClipboardCheck,
  FileText,
  House,
  LogOut,
  Megaphone,
  UserRound,
} from "lucide-react";
import "../../../styles/dashboard/shared.css";
import "../../../styles/dashboard/student.css";
import { apiRequest } from "../../../services/api";
import AdminCrudModal, { CrudField } from "../admin/components/AdminCrudModal";
import SkeletonLoader from "../../../components/SkeletonLoader";
import OverviewPage from "./pages/OverviewPage";
import ClassesPage from "./pages/ClassesPage";
import GradebookPage from "./pages/GradebookPage";
import AttendancePage from "./pages/AttendancePage";
import ResourcesPage from "./pages/ResourcesPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import ProfilePage from "./pages/ProfilePage";

export type TeacherRecord = {
  id?: number;
  employee_number?: string;
  first_name?: string;
  last_name?: string;
  department?: string | null;
  status?: string | null;
};

export type TeacherGradeCell = {
  grade_id: number | null;
  value: number | null;
  locked_at: string | null;
  max_score: number;
};

export type TeacherRosterStudent = {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  program: string;
  attendance_pct: number;
  current_grade_value: number | null;
  current_grade: string;
  grades: Record<number, TeacherGradeCell>;
};

export type TeacherAssessment = {
  id: number;
  title: string;
  type: string;
  max_score: number;
  weight: number;
  due_date: string | null;
  published: boolean;
};

export type TeacherClass = {
  id: number;
  course_code: string;
  course_title: string;
  section: string;
  room: string;
  semester_name: string;
  student_count: number;
  next_class: string;
  pending_grades: number;
  roster: TeacherRosterStudent[];
  assessments: TeacherAssessment[];
  announcements: Array<{ id: number; title: string; body: string; audience: string; published_at: string; link_url?: string }>;
  timetable: Array<{ day: string; time: string; room: string; course_title: string }>;
};

export type TeacherDashboardResponse = {
  teacher: { id: number; employee_number: string; first_name: string; last_name: string; department: string; status: string };
  totals: { courses: number; pending_grades: number; low_attendance: number; announcements: number };
  classes: TeacherClass[];
  announcements: Array<{ id: number; title: string; body: string; audience: string; published_at: string; link_url?: string }>;
};

export type TeacherTab = "overview" | "classes" | "gradebook" | "attendance" | "timetable" | "announcements" | "profile";

const tabLabels: Record<TeacherTab, string> = {
  overview: "Home",
  classes: "My courses",
  gradebook: "Gradebook",
  attendance: "Attendance",
  timetable: "Timetable",
  announcements: "Announcements",
  profile: "Profile",
};

type TeacherModalState = { title: string; submitLabel: string; fields: CrudField[]; onSubmit: (values: Record<string, string>) => Promise<void> | void };

export default function TeacherDashboard() {
  const [tab, setTab] = useState<TeacherTab>("overview");
  const [summary, setSummary] = useState<TeacherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<TeacherModalState | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams<{ section?: string; classId?: string }>();

  useEffect(() => {
    const section = params.section ?? "overview";
    if (["overview", "classes", "gradebook", "attendance", "timetable", "announcements", "profile"].includes(section)) {
      setTab(section as TeacherTab);
    }
  }, [params.section]);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const data = await apiRequest<TeacherDashboardResponse>("/dashboard/teacher");
        if (active) {
          setSummary(data);
          const classList = data.classes ?? [];
          if (classList.length) {
            const targetClassId = Number(params.classId ?? classList[0].id);
            const nextId = Number.isFinite(targetClassId) ? targetClassId : classList[0].id;
            const exists = classList.some((cls) => cls.id === nextId);
            setSelectedClassId(exists ? nextId : classList[0].id);
          } else {
            setSelectedClassId(null);
          }
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load teacher dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => { active = false; };
  }, [params.classId]);

  const dashboardClasses = summary?.classes ?? [];

  const handleSelectClass = (nextClassId: number) => {
    setSelectedClassId(nextClassId);
    navigate(`/dashboard/teacher/gradebook/${nextClassId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("collegeAuthToken");
    localStorage.removeItem("collegeUser");
    sessionStorage.removeItem("collegeSessionToken");
    sessionStorage.removeItem("collegeUser");
    navigate("/login", { replace: true });
  };

  const renderPage = () => {
    if (tab === "overview") return <OverviewPage data={summary} loading={loading} />;
    if (tab === "classes") return <ClassesPage data={summary} loading={loading} onOpenGradebook={handleSelectClass} />;
    if (tab === "gradebook") return <GradebookPage classes={dashboardClasses} selectedClassId={selectedClassId} loading={loading} onSelectClass={handleSelectClass} />;
    if (tab === "attendance") return <AttendancePage data={summary} loading={loading} />;
    if (tab === "timetable") return <ResourcesPage data={summary} loading={loading} />;
    if (tab === "announcements") return <AnnouncementsPage data={summary} loading={loading} />;
    return <ProfilePage data={summary} loading={loading} />;
  };

  return (
    <div className="sa-dashboard sa-student">
      <aside className={`sa-sidebar ${isSidebarOpen ? "is-open" : ""}`} aria-expanded={isSidebarOpen} aria-label="Teacher sidebar navigation">
        <div className="sa-sidebar-header">
          <div className="sa-brand"><div className="sa-crest">SA</div><div><strong>SAINT ANTHONY'S</strong><span>TECHNICAL COLLEGE</span></div></div>
          <button type="button" className="sa-sidebar-close" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>
        <div className="sa-role">FACULTY WORKSPACE</div>
        <nav className="sa-nav">
          <a className={tab === "overview" ? "active" : ""} href="#overview" onClick={() => { setTab("overview"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><House size={15} /></span> Home</a>
          <a className={tab === "classes" ? "active" : ""} href="#classes" onClick={() => { setTab("classes"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><BookOpenText size={15} /></span> My courses</a>
          <a className={tab === "gradebook" ? "active" : ""} href="#gradebook" onClick={() => { setTab("gradebook"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><FileText size={15} /></span> Gradebook</a>
          <a className={tab === "attendance" ? "active" : ""} href="#attendance" onClick={() => { setTab("attendance"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><ClipboardCheck size={15} /></span> Attendance</a>
          <a className={tab === "timetable" ? "active" : ""} href="#timetable" onClick={() => { setTab("timetable"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><CalendarDays size={15} /></span> Timetable</a>
          <a className={tab === "announcements" ? "active" : ""} href="#announcements" onClick={() => { setTab("announcements"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><Megaphone size={15} /></span> Announcements</a>
          <a className={tab === "profile" ? "active" : ""} href="#profile" onClick={() => { setTab("profile"); setIsSidebarOpen(false); }}><span className="sa-nav-icon"><UserRound size={15} /></span> Profile</a>
        </nav>
        <div className="sa-sidebar-logout">
          <button type="button" className="sa-logout-btn" onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
        <div className="sa-sidebar-bottom"><div className="sa-help-icon">?</div><div><strong>Faculty support</strong><span>Teaching & learning office</span></div><span className="sa-chevron">›</span></div>
      </aside>

      <main className="sa-main">
        <header className="sa-topbar">
          <button type="button" className="sa-mobile-menu-toggle" aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"} aria-expanded={isSidebarOpen} onClick={() => setIsSidebarOpen((open) => !open)}>☰</button>
          <div className="sa-breadcrumb">Faculty Workspace <span>/</span> {tabLabels[tab]}</div>
        </header>

        <section className="sa-content">
          {error && <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>}
          <div className="sa-page-heading">
            <div>
              <div className="sa-eyebrow">FACULTY WORKSPACE / TEACHING</div>
              <h1>{tabLabels[tab]}</h1>
              <p>Manage classes, attendance, grades, and learning resources.</p>
            </div>
          </div>
          {loading ? <SkeletonLoader /> : renderPage()}
        </section>
      </main>

      {modal && (
        <AdminCrudModal open={!!modal} title={modal.title} submitLabel={modal.submitLabel} fields={modal.fields} onClose={() => setModal(null)} onSubmit={async (values) => { await modal.onSubmit(values); setModal(null); }} />
      )}
    </div>
  );
}