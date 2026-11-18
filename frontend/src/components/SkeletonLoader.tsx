import React from "react";
import "../styles/dashboard/shared.css";

type SkeletonLoaderProps = {
  className?: string;
};

export default function SkeletonLoader({ className }: SkeletonLoaderProps) {
  return (
    <div className={`sa-skeleton-loader ${className ?? ""}`} aria-busy="true" aria-label="Loading dashboard">
      <div className="sa-skeleton-grid">
        {[1, 2, 3, 4].map((i) => (
          <article key={i} className="sa-skeleton-stat-card">
            <div className="sa-skeleton-icon sa-skeleton-circle" />
            <div className="sa-skeleton-text sa-skeleton-lg" />
            <div className="sa-skeleton-text sa-skeleton-sm" />
          </article>
        ))}
      </div>
      <div className="sa-skeleton-stack">
        <section className="sa-skeleton-panel">
          <div className="sa-skeleton-heading sa-skeleton-text sa-skeleton-md" />
          <div className="sa-skeleton-body sa-skeleton-text" />
          <div className="sa-skeleton-body sa-skeleton-text sa-skeleton-short" />
          <div className="sa-skeleton-body sa-skeleton-text sa-skeleton-short" />
        </section>
        <section className="sa-skeleton-panel">
          <div className="sa-skeleton-heading sa-skeleton-text sa-skeleton-md" />
          <div className="sa-skeleton-body sa-skeleton-text" />
          <div className="sa-skeleton-body sa-skeleton-text sa-skeleton-short" />
        </section>
      </div>
    </div>
  );
}
