import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../services/api";
import KpiCard from "../components/KpiCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

type Overview = {
  kpis: { students: number; staff: number; activeCourses: number; todayAttendanceRate: number | null };
  upcomingExams: Array<{
    scheduleId: number;
    examDate: string;
    startsAt: string;
    endsAt: string;
    status: string;
    assessmentTitle: string;
    assessmentType: string;
    courseCode: string;
    courseTitle: string;
    room: string | null;
  }>;
  upcomingEvents: Array<{
    eventId: number;
    title: string;
    eventType: string;
    startsAt: string;
    endsAt: string;
    location: string | null;
  }>;
  recentActivity: Array<{
    id: number;
    action: string;
    entityType: string;
    entityId: number | null;
    createdAt: string;
    actor: string | null;
  }>;
};

type Props = { data: any; loading: boolean };

export default function OverviewPage({ loading: parentLoading }: Props) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiRequest<Overview>("/dashboard/admin/overview");
        if (active) setOverview(res);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load overview.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading || parentLoading) return <LoadingState message="Loading dashboard…" />;
  if (error) return <ErrorState message={error} />;
  if (!overview) return <ErrorState message="No overview data." />;

  const { kpis, upcomingExams, upcomingEvents, recentActivity } = overview;

  const quickActions = [
    { label: "Add student", href: "#students" },
    { label: "Register staff", href: "#faculty" },
    { label: "Publish notice", href: "#announcements" },
    { label: "Manual enrollment", href: "#programs" },
  ];

  return (
    <div className="sa-st-report">
      <div className="sa-stat-grid">
        <KpiCard label="Students" value={kpis.students.toLocaleString()} hint="Total enrolled students" icon="♙" tone="gold" />
        <KpiCard label="Staff" value={kpis.staff.toLocaleString()} hint="Teaching staff profiles" icon="♧" tone="blue" />
        <KpiCard label="Active courses" value={kpis.activeCourses.toLocaleString()} hint="Open course offerings" icon="▤" tone="green" />
        <KpiCard
          label="Today's attendance"
          value={kpis.todayAttendanceRate == null ? "—" : `${kpis.todayAttendanceRate}%`}
          hint="Attendance rate for today"
          icon="◷"
          tone="rose"
        />
      </div>

      <div className="sa-st-grid2">
        <section className="sa-panel" aria-labelledby="admin-quick-actions">
          <div className="sa-panel-heading">
            <div>
              <h3 id="admin-quick-actions">Quick actions</h3>
              <p>Registrar tasks and daily workflow</p>
            </div>
          </div>
          <div className="sa-task-list">
            {quickActions.map((action) => (
              <div key={action.label} className="sa-task-row">
                <div className="sa-task-dot" aria-hidden="true">{action.label.slice(0, 2).toUpperCase()}</div>
                <div className="sa-task-info">
                  <strong>{action.label}</strong>
                  <span>{action.href.replace("#", "")}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sa-panel" aria-labelledby="admin-upcoming-exams">
          <div className="sa-panel-heading">
            <div>
              <h3 id="admin-upcoming-exams">Upcoming exams</h3>
              <p>Exam schedule</p>
            </div>
          </div>
          <div className="sa-task-list">
            {upcomingExams.length === 0 ? (
              <div className="sa-task-row"><div className="sa-task-info"><strong>No upcoming exams</strong><span>Schedule exams to see them here.</span></div></div>
            ) : (
              upcomingExams.map((exam) => (
                <div key={exam.scheduleId} className="sa-task-row">
                  <div className="sa-task-dot" aria-hidden="true">◷</div>
                  <div className="sa-task-info">
                    <strong>{exam.courseCode} — {exam.assessmentTitle}</strong>
                    <span>{exam.courseTitle}</span>
                    <small>{new Date(exam.examDate).toLocaleDateString()} {exam.startsAt}</small>
                  </div>
                  <span className="sa-badge info">{exam.status}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="sa-st-grid2">
        <section className="sa-panel" aria-labelledby="admin-upcoming-events">
          <div className="sa-panel-heading">
            <div>
              <h3 id="admin-upcoming-events">Upcoming events</h3>
              <p>Academic calendar</p>
            </div>
          </div>
          <div className="sa-task-list">
            {upcomingEvents.length === 0 ? (
              <div className="sa-task-row"><div className="sa-task-info"><strong>No upcoming events</strong><span>Add calendar events to see them here.</span></div></div>
            ) : (
              upcomingEvents.map((ev) => (
                <div key={ev.eventId} className="sa-task-row">
                  <div className="sa-task-dot" aria-hidden="true">◷</div>
                  <div className="sa-task-info">
                    <strong>{ev.title}</strong>
                    <span>{ev.eventType}</span>
                    <small>{new Date(ev.startsAt).toLocaleString()} {ev.location ? `· ${ev.location}` : ""}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="sa-panel" aria-labelledby="admin-recent-activity">
          <div className="sa-panel-heading">
            <div>
              <h3 id="admin-recent-activity">Recent activity</h3>
              <p>Latest institutional updates</p>
            </div>
          </div>
          <div className="sa-task-list">
            {recentActivity.length === 0 ? (
              <div className="sa-task-row"><div className="sa-task-info"><strong>No recent activity</strong><span>Audit log is empty.</span></div></div>
            ) : (
              recentActivity.map((a) => (
                <div key={a.id} className="sa-task-row">
                  <div className="sa-task-dot" aria-hidden="true">✓</div>
                  <div className="sa-task-info">
                    <strong>{a.action}</strong>
                    <span>{a.entityType}{a.entityId ? ` #${a.entityId}` : ""}</span>
                    <small>{a.actor ?? "system"} · {new Date(a.createdAt).toLocaleString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}