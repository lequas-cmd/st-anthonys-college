import React from "react";
import { AdminDashboardResponse } from "../adminUtils";

type Props = { data: AdminDashboardResponse | null; loading: boolean };

export default function FacultyPage({ data, loading }: Props) {
  const totals = data?.totals ?? { students: 0, teachers: 0, users: 0 };

  return (
    <div className="sa-st-report">
      <div className="sa-stat-grid">
        <article className="sa-stat-card">
          <div className="sa-stat-top"><span>Faculty loaded</span><b className="sa-stat-icon gold">∑</b></div>
          <strong>{loading ? "…" : totals.teachers}</strong>
          <p>Profiles in the current institution directory</p>
        </article>

        <article className="sa-stat-card">
          <div className="sa-stat-top"><span>Department heads</span><b className="sa-stat-icon blue">◇</b></div>
          <strong>{Math.max(1, Math.round((totals.teachers || 0) * 0.12))}</strong>
          <p>Academic team leads and coordinators</p>
        </article>

        <article className="sa-stat-card">
          <div className="sa-stat-top"><span>Assignments</span><b className="sa-stat-icon green">✓</b></div>
          <strong>{Math.max(6, Math.round((totals.teachers || 0) * 0.7))}</strong>
          <p>Classes and practical sessions scheduled</p>
        </article>

        <article className="sa-stat-card">
          <div className="sa-stat-top"><span>Review queue</span><b className="sa-stat-icon rose">!</b></div>
          <strong>{Math.max(2, Math.round((totals.teachers || 0) * 0.08))}</strong>
          <p className="sa-text-warning">Pending profile checks</p>
        </article>
      </div>

      <section className="sa-panel" aria-labelledby="faculty-page-title">
        <div className="sa-panel-heading">
          <div>
            <h3 id="faculty-page-title">Faculty management overview</h3>
            <p>Staff coordination, scheduling, and review status</p>
          </div>
        </div>

        <div className="sa-task-list">
          <div className="sa-task-row">
            <div className="sa-task-dot" aria-hidden="true">01</div>
            <div className="sa-task-info"><strong>Department planning</strong><span>Review teacher allocations for the current term</span></div>
            <span className="sa-badge info">Scheduled</span>
          </div>
          <div className="sa-task-row">
            <div className="sa-task-dot" aria-hidden="true">02</div>
            <div className="sa-task-info"><strong>Attendance monitoring</strong><span>Track staff punctuality and attendance compliance</span></div>
            <span className="sa-badge success">Healthy</span>
          </div>
          <div className="sa-task-row">
            <div className="sa-task-dot" aria-hidden="true">03</div>
            <div className="sa-task-info"><strong>Assessment coordination</strong><span>Confirm exam and portfolio review windows are active</span></div>
            <span className="sa-badge warning">Review</span>
          </div>
        </div>
      </section>
    </div>
  );
}
