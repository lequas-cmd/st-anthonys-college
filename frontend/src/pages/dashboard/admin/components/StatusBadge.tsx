import React from "react";

type Tone = "success" | "warning" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "success",
  warning: "warning",
  info: "info",
  neutral: "",
};

type Props = {
  label: string;
  tone?: Tone;
};

export default function StatusBadge({ label, tone = "neutral" }: Props) {
  const cls = toneClass[tone];
  return <span className={`sa-badge ${cls}`.trim()}>{label}</span>;
}