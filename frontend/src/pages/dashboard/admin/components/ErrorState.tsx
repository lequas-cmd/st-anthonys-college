import React from "react";

export default function ErrorState({ message }: { message: string }) {
  return <div className="sa-alert-panel"><strong>Error:</strong> {message}</div>;
}