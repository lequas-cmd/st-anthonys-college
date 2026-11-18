import React from "react";
import type { TeacherDashboardResponse } from "../TeacherDashboard";

type Props = {
  data: TeacherDashboardResponse | null;
  loading: boolean;
  onOpenGradebook: (classId: number) => void;
};

export default function ClassesPage({ data, loading, onOpenGradebook }: Props) {
  const classes = data?.classes ?? [];

  return (
    <section className="sa-panel sa-st-flush" aria-labelledby="teacher-classes-title">
      <div className="sa-st-padded">
        <div className="sa-panel-heading">
          <div>
            <h3 id="teacher-classes-title">My courses</h3>
            <p>{classes.length} active course sections</p>
          </div>
        </div>
      </div>

      <div className="sa-table-wrap">
        <table className="sa-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Code</th>
              <th>Section</th>
              <th>Students</th>
              <th>Attendance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Loading courses…</td></tr>
            ) : classes.length ? (
              classes.map((course) => {
                const avgAttendance = course.roster.length
                  ? Math.round(course.roster.reduce((sum, student) => sum + student.attendance_pct, 0) / course.roster.length)
                  : 0;

                return (
                  <tr key={course.id}>
                    <td>{course.course_title}</td>
                    <td>{course.course_code}</td>
                    <td>{course.section}</td>
                    <td>{course.student_count}</td>
                    <td>{avgAttendance}%</td>
                    <td>
                      <button className="sa-button sa-button-outline" type="button" onClick={() => onOpenGradebook(course.id)}>
                        Open gradebook
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={6}>No assigned classes available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
