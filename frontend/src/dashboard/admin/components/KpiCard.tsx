import React from "react";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
  tone?: "gold" | "blue" | "green" | "rose";
};

export default function KpiCard({ label, value, hint, icon, tone = "gold" }: Props) {
  return (
    <article className="sa-stat-card">
      <div className="sa-stat-top">
        <span>{label}</span>
        <b className={`sa-stat-icon ${tone}`}>{icon ?? "•"}</b>
      </div>
      <strong>{value}</strong>
      {hint ? <p>{hint}</p> : null}
    </article>
  );
}