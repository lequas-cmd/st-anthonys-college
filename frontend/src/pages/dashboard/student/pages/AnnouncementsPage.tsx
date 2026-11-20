import React, { useEffect, useState } from "react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import { StudentAnnouncementsResponse, StudentAnnouncement, formatDate, scopeLabel } from "../utils/studentPortal";

type Props = {
  studentId: number;
  studentName: string;
};

export default function AnnouncementsPage({ studentId, studentName }: Props) {
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readSet, setReadSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    const loadAnnouncements = async () => {
      try {
        const data = await apiRequest<StudentAnnouncementsResponse>("/dashboard/student/announcements");
        if (active) {
          setAnnouncements(data.announcements ?? []);
          setUnreadCount(data.unread_count ?? 0);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your announcements.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAnnouncements();
    return () => { active = false; };
  }, []);

  const markRead = async (id: number) => {
    if (readSet.has(id)) return;
    try {
      await apiRequest(`/dashboard/student/announcements/${id}/read`, {
        method: "POST",
      });
      setReadSet((prev) => new Set([...prev, id]));
      setAnnouncements((list) =>
        list.map((a) => (a.id === id ? { ...a, is_read: true } : a)),
      );
      setUnreadCount((n) => Math.max(0, n - 1));
    } catch {
      // Silently ignore mark-as-read failures; the announcement still displays.
    }
  };

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>;

  return (
    <>
      <section className="sa-card" aria-labelledby="overview-h">
        <div className="sa-card-heading">
          <div>
            <h3 id="overview-h">Announcements</h3>
            <p>
              College, department and class notices. Unread items are marked — open one to mark it as read.
              {unreadCount > 0 ? <span className="sa-badge terracotta">{unreadCount} unread</span> : null}
            </p>
          </div>
        </div>

        {announcements.length === 0 ? (
          <p className="sa-st-empty">No announcements have been published yet.</p>
        ) : (
          <div className="sa-st-stack">
            {announcements.map((notice) => (
              <article
                key={notice.id}
                className={`sa-notice-card${notice.is_unread === false ? " is-read" : " is-unread"}`}
                onClick={() => !notice.is_read && markRead(notice.id)}
                role="button"
                tabIndex={0}
              >
                <div className="sa-notice-dot" aria-hidden="true">{notice.is_read ? "✓" : "•"}</div>
                <div className="sa-notice-info">
                  <span className="notice-title">{notice.title}</span>
                  <span className="notice-body">{notice.body}</span>
                  <span className="notice-meta">
                    {formatDate(notice.published_at)} · {scopeLabel(notice.scope)}
                  </span>
                </div>
                <span className={`sa-badge ${notice.is_read ? "success" : "info"}`}>
                  {notice.is_read ? "Read" : "Unread"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
