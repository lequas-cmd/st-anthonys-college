import React from "react";

export default function LoadingState({ message = "Loading…" }: { message?: string }) {
  return <div className="sa-panel"><p>{message}</p></div>;
}