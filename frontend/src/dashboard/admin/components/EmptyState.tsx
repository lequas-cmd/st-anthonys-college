import React from "react";

type Props = { title?: string; message: string };

export default function EmptyState({ title = "No records", message }: Props) {
  return (
    <div className="sa-panel">
      <div className="sa-panel-heading">
        <div>
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}