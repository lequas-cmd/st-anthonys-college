import React, { useEffect, useState } from "react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import { StudentTimetableResponse, formatTimeRange, statusTone } from "../utils/studentPortal";

type Props = {
  studentId: number;
  studentName: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetablePage({ studentId, studentName }: Props) {
  const [data, setData] = useState<StudentTimetableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadTimetable = async () => {
      try {
        const payload = await apiRequest<StudentTimetableResponse>("/dashboard/student/timetable");
        if (active) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your timetable.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTimetable();
    return () => { active = false; };
  }, []);

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>;
  if (!data) return null;

  const entriesByDay: Record<number, NonNullable<StudentTimetableResponse["entries"]>[number][]> = {};
  for (const e of data.entries) {
    if (!entriesByDay[e.weekday]) entriesByDay[e.weekday] = [];
    entriesByDay[e.weekday].push(e);
  }

  return (
    <>
      <section className="sa-card" aria-labelledby="tt-h">
        <div className="sa-card-heading">
          <div>
            <h3 id="tt-h">Timetable</h3>
            <p>Your weekly class schedule for the current term.</p>
          </div>
        </div>

        {data.entries.length === 0 ? (
          <p className="sa-st-empty">No timetable entries have been scheduled for your courses yet.</p>
        ) : (
          <div className="sa-st-timetable-wrap">
            <div className="sa-st-week">
              {DAYS.map((day, i) => {
                const weekday = i + 1;
                const dayEntries = entriesByDay[weekday] ?? [];
                const isToday = weekday === new Date().getDay() || weekday === ((new Date().getDay() + 6) % 7) + 1;
                return (
                  <section key={day} className={`sa-st-weekcol${isToday ? " is-today" : ""}`}>
                    <header>
                      <b>{day}</b>
                      <span>{dayEntries.length} class{dayEntries.length === 1 ? "" : "es"}</span>
                    </header>
                    <div className="sa-st-weekitems">
                      {dayEntries.length === 0 ? (
                        <p className="sa-st-none">No classes</p>
                      ) : (
                        dayEntries.map((entry) => (
                          <article
                            key={entry.id}
                            className={`sa-st-chip${isToday ? " is-selected" : ""}`}
                          >
                            <span className="sa-st-chip-time">{formatTimeRange(entry.starts_at, entry.ends_at)}</span>
                            <span className="sa-st-chip-title">
                              <strong>{entry.course_code}</strong>
                              <span>{entry.course_title}</span>
                            </span>
                            <span className="sa-st-chip-room">{entry.room || "Room TBA"}</span>
                            <span className={`sa-badge ${statusTone(entry.status)}`}>{entry.status}</span>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="sa-card" aria-labelledby="list-h">
        <div className="sa-card-heading">
          <div><h3 id="list-h">All classes (chronological)</h3><p>Ordered by day and start time.</p></div>
        </div>
        {data.entries.length === 0 ? (
          <p className="sa-st-empty">No timetable entries to display.</p>
        ) : (
          <table className="sa-table sa-st-restable" role="region" aria-label="Timetable entries">
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Course</th>
                <th scope="col">Time</th>
                <th scope="col">Room</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e) => (
                <tr key={e.id}>
                  <td data-label="Day">{DAYS[e.weekday - 1]}</td>
                  <td data-label="Course">
                    <strong>{e.course_code}</strong>
                    <small className="sa-st-block">{e.course_title}</small>
                  </td>
                  <td data-label="Time">{formatTimeRange(e.starts_at, e.ends_at)}</td>
                  <td data-label="Room">{e.room || "Room TBA"}</td>
                  <td data-label="Status">
                    <span className={`sa-badge ${statusTone(e.status)}`}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
