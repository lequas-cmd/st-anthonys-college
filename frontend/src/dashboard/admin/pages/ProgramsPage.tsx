import React from "react";
import { AdminDashboardResponse } from "../adminUtils";

type Props = { data: AdminDashboardResponse | null };

export default function ProgramsPage({ data }: Props) {
  const totals = data?.totals ?? { students: 0, teachers: 0, users: 0 };
  const totalEnrollment = totals.students || 0;

  const departments = [
    { name: "Electrical & Electronics", value: Math.round(totalEnrollment * 0.34), color: "gold", track: Math.min(100, Math.round((totalEnrollment * 0.34) / 4)) },
    { name: "Information Technology", value: Math.round(totalEnrollment * 0.26), color: "blue", track: Math.min(100, Math.round((totalEnrollment * 0.26) / 3)) },
    { name: "Automotive Technology", value: Math.round(totalEnrollment * 0.22), color: "green", track: Math.min(100, Math.round((totalEnrollment * 0.22) / 2.5)) },
    { name: "Construction Technology", value: Math.round(totalEnrollment * 0.18), color: "rose", track: Math.min(100, Math.round((totalEnrollment * 0.18) / 2.4)) },
  ];

  return (
    <section className="sa-panel sa-st-flush" aria-labelledby="programs-page-title">
      <div className="sa-st-padded">
        <div className="sa-panel-heading" style={{ marginBottom: 8 }}>
          <div>
            <h3 id="programs-page-title">Enrollment by department</h3>
            <p>Program demand and utilization view</p>
          </div>
        </div>

        <div className="sa-task-list">
          {departments.map((department) => (
            <div key={department.name} className="sa-task-row">
              <div className="sa-task-dot" aria-hidden="true">{department.name.slice(0, 2).toUpperCase()}</div>
              <div className="sa-task-info">
                <strong>{department.name}</strong>
                <span>{department.value} enrolled students</span>
                <div className="sa-progress" style={{ marginTop: 8 }}>
                  <i className={department.color} style={{ width: `${department.track}%` }} />
                </div>
              </div>
              <span className="sa-badge info">{department.track}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
