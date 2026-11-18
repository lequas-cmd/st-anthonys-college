import React from "react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="sa-modal-backdrop" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal-header">
          <div>
            <div className="sa-eyebrow">CONFIRM ACTION</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="sa-link-button" onClick={onCancel}>Close ✕</button>
        </div>
        <div className="sa-modal-form">
          <p>{message}</p>
          <div className="sa-modal-actions">
            <button type="button" className="sa-button sa-button-outline" onClick={onCancel}>{cancelLabel}</button>
            <button
              type="button"
              className={`sa-button ${tone === "danger" ? "sa-button-primary" : "sa-button-outline"}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}