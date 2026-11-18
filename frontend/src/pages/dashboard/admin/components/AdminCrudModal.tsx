import React, { useEffect, useMemo, useState } from "react";

export type CrudFieldOption = { value: string; label: string };

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "password" | "textarea" | "select" | "date";
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  options?: CrudFieldOption[];
  min?: number;
  max?: number;
};

type Props = {
  open: boolean;
  title: string;
  submitLabel: string;
  fields: CrudField[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
};

export default function AdminCrudModal({ open, title, submitLabel, fields, onClose, onSubmit }: Props) {
  const initialValues = useMemo(() => Object.fromEntries(fields.map((field) => [field.name, String(field.defaultValue ?? "")])), [fields]);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setSaving(false);
  }, [initialValues, open]);

  if (!open) return null;

  const validate = () => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      const v = (values[field.name] ?? "").trim();
      if (field.required && !v) next[field.name] = `${field.label} is required.`;
      if (field.type === "email" && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) next[field.name] = "Enter a valid email.";
      if (field.type === "number" && v) {
        const n = Number(v);
        if (!Number.isFinite(n)) next[field.name] = "Enter a valid number.";
        else {
          if (field.min != null && n < field.min) next[field.name] = `Minimum ${field.min}.`;
          if (field.max != null && n > field.max) next[field.name] = `Maximum ${field.max}.`;
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sa-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title" onClick={onClose}>
      <div className="sa-modal" onClick={(event) => event.stopPropagation()}>
        <div className="sa-modal-header">
          <div>
            <div className="sa-eyebrow">ADMIN ACTION</div>
            <h3 id="admin-modal-title">{title}</h3>
          </div>
          <button type="button" className="sa-link-button" onClick={onClose}>Close ✕</button>
        </div>

        <form onSubmit={handleSubmit} className="sa-modal-form">
          {fields.map((field) => (
            <label key={field.name} className="sa-modal-field">
              <span>{field.label}{field.required ? " *" : ""}</span>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.name] ?? ""}
                  required={field.required}
                  placeholder={field.placeholder}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  rows={4}
                />
              ) : field.type === "select" ? (
                <select
                  value={values[field.name] ?? ""}
                  required={field.required}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                  required={field.required}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                />
              )}
              {errors[field.name] ? <small>{errors[field.name]}</small> : null}
            </label>
          ))}

          <div className="sa-modal-actions">
            <button type="button" className="sa-button sa-button-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="sa-button sa-button-primary" disabled={saving}>{saving ? "Saving…" : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}