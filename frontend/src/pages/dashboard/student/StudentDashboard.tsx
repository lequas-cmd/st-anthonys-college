import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpenText,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  House,
  LogOut,
  Megaphone,
  UserRound,
} from "lucide-react";
import "../../../styles/dashboard/shared.css";
import "../../../styles/dashboard/student.css";
import { apiRequest } from "../../../services/api";
import SkeletonLoader from "../../../components/SkeletonLoader";
import { StudentHomeResponse, StudentTab } from "./utils/studentPortal";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import GradesPage from "./pages/GradesPage";
import AttendancePage from "./pages/AttendancePage";
import TimetablePage from "./pages/TimetablePage";
import ExamsPage from "./pages/ExamsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import TranscriptPage from "./pages/TranscriptPage";
import ProfilePage from "./pages/ProfilePage";

const NAV: Array<{ id: StudentTab; label: string; icon: React.ReactNode }> = [
  { id: "home", label: "Home", icon: <House size={15} /> },
  { id: "courses", label: "My courses", icon: <BookOpenText size={15} /> },
  { id: "grades", label: "Grades", icon: <BarChart3 size={15} /> },
  { id: "attendance", label: "Attendance", icon: <ClipboardCheck size={15} /> },
  { id: "timetable", label: "Timetable", icon: <CalendarDays size={15} /> },
  { id: "exams", label: "Exams", icon: <FileText size={15} /> },
  { id: "announcements", label: "Announcements", icon: <Megaphone size={15} /> },
  { id: "transcript", label: "Transcript", icon: <GraduationCap size={15} /> },
  { id: "profile", label: "Profile", icon: <UserRound size={15} /> },
];

const TAB_LABELS: Record<StudentTab, string> = Object.fromEntries(
  NAV.map((item) => [item.id, item.label]),
) as Record<StudentTab, string>;

const TAB_INTRO: Record<StudentTab, string> = {
  home: "Your classes, results and notices at a glance.",
  courses: "Registrar-enrolled classes with instructor, room and schedule. Each class opens its attendance and grades.",
  grades: "Assessment marks, totals and letter grades for published results, plus your GPA by term.",
  attendance: "Attendance rate for each class, with the sessions you missed.",
  timetable: "Your weekly class schedule.",
  exams: "Upcoming exam dates, times and rooms.",
  announcements: "College, department and class notices, with unread markers.",
  transcript: "Published terms only, with a printable official transcript.",
  profile: "Your details, plus changes to phone, email and password.",
};

export default function StudentDashboard() {
  const [tab, setTab] = useState<StudentTab>("home");
  const [home, setHome] = useState<StudentHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadHome = async () => {
      try {
        const payload = await apiRequest<StudentHomeResponse>("/dashboard/student/home");
        if (active) {
          setHome(payload);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load your student dashboard.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHome();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("collegeAuthToken");
    localStorage.removeItem("collegeUser");
    sessionStorage.removeItem("collegeSessionToken");
    sessionStorage.removeItem("collegeUser");
    navigate("/login", { replace: true });
  };

  const selectTab = (next: StudentTab) => {
    setTab(next);
    setIsSidebarOpen(false);
  };

  const studentId = home?.student.id ?? null;
  const studentName = home?.student.full_name ?? "Student";
  const eyebrow = home?.term ? `Student Portal / ${home.term.academic_year}` : "Student Portal";

  const renderPage = () => {
    if (tab === "home") {
      if (!home) return <div className="sa-alert-panel">Your dashboard could not load.</div>;
      return <HomePage data={home} onNavigate={selectTab} />;
    }
    if (tab === "courses") return <CoursesPage />;
    if (tab === "grades") return <GradesPage studentId={studentId ?? 0} studentName={studentName} />;
    if (tab === "attendance") return <AttendancePage studentId={studentId ?? 0} studentName={studentName} />;
    if (tab === "timetable") return <TimetablePage studentId={studentId ?? 0} studentName={studentName} />;
    if (tab === "exams") return <ExamsPage studentId={studentId ?? 0} studentName={studentName} />;
    if (tab === "announcements") return <AnnouncementsPage studentId={studentId ?? 0} studentName={studentName} />;
    if (tab === "transcript") return <TranscriptPage studentId={studentId ?? 0} studentName={studentName} />;
    if (tab === "profile") return <ProfilePage studentId={studentId ?? 0} studentName={studentName} />;
    return null;
  };

  return (
    <div className="sa-dashboard sa-student">
      <aside
        className={`sa-sidebar ${isSidebarOpen ? "is-open" : ""}`}
        aria-expanded={isSidebarOpen}
        aria-label="Student sidebar navigation"
      >
        <div className="sa-sidebar-header">
          <div className="sa-brand">
            <div className="sa-crest">
              <img
                src="/images/college-logo.png"
                alt="Saint Anthony's College"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <strong>Saint Anthony's</strong>
              <span>Technical & Vocational College</span>
            </div>
          </div>
          <button
            type="button"
            className="sa-sidebar-close"
            aria-label="Close navigation"
            onClick={() => setIsSidebarOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="sa-role">Student Portal</div>
        <nav className="sa-nav">
          {NAV.map((item) => (
            <a
              key={item.id}
              className={tab === item.id ? "active" : ""}
              href={`#${item.id}`}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => selectTab(item.id)}
            >
              <span className="sa-nav-icon">{item.icon}</span> {item.label}
            </a>
          ))}
        </nav>
        <div className="sa-sidebar-logout">
          <button type="button" className="sa-logout-btn" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
        <div className="sa-sidebar-bottom">
          <div className="sa-help-icon">?</div>
          <div>
            <strong>Student support</strong>
            <span>Academic help desk</span>
          </div>
          <span className="sa-chevron">›</span>
        </div>
      </aside>

      <main className="sa-main">
        <header className="sa-topbar">
          <button
            type="button"
            className="sa-mobile-menu-toggle"
            aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((open) => !open)}
          >
            ☰
          </button>
          <div className="sa-breadcrumb">
            Student Portal <span>/</span> {TAB_LABELS[tab]}
          </div>
          <div className="sa-topbar-end">
            <span className="sa-topbar-name">{studentName}</span>
            <span className="sa-topbar-role">
              <span className="sa-topbar-role-pip" aria-hidden="true"></span>
              Student
            </span>
            <a
              href="/"
              className="sa-topbar-collegelink"
              aria-label="Go to college website"
              target="_blank"
              rel="noopener noreferrer"
            >
              ← College website
            </a>
          </div>
        </header>

        <section className="sa-content">
          {error && (
            <div className="sa-alert-panel">
              <strong>Live data unavailable:</strong> {error}
            </div>
          )}
          <div className="sa-page-heading">
            <div>
              <div className="sa-eyebrow">{eyebrow}</div>
              <h1>{TAB_LABELS[tab]}</h1>
              <p>{TAB_INTRO[tab]}</p>
            </div>
            <div className="sa-heading-actions" />
          </div>
          {loading ? <SkeletonLoader /> : renderPage()}
        </section>
      </main>
    </div>
  );
}
