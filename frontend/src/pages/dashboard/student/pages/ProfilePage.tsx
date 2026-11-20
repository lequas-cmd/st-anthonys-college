import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import "../../../../styles/dashboard/shared.css";
import "../../../../styles/dashboard/student.css";
import { apiRequest } from "../../../../services/api";
import SkeletonLoader from "../../../../components/SkeletonLoader";
import { formatDate, initialsOf } from "../utils/studentPortal";

type Props = {
  studentId: number;
  studentName: string;
};

export default function ProfilePage({ studentId, studentName }: Props) {
  const [profile, setProfile] = useState<{
    id: number;
    student_number: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    full_name: string;
    photo_url: string | null;
    program: string;
    program_code: string | null;
    department: string | null;
    level_number: number | null;
    enrollment_year: number | null;
    status: string;
    email: string | null;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    class_group_id: number | null;
    editable_fields: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editField, setEditField] = useState<"phone" | "email" | "password" | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const data = await apiRequest<any>("/dashboard/student/profile");
        if (active) {
          setProfile(data);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load your profile.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProfile();
    return () => { active = false; };
  }, []);

  const handleSave = async (field: "phone" | "email" | "password") => {
    setSaving(true);
    setSaveMessage(null);
    try {
      if (field === "password") {
        await apiRequest("/dashboard/student/profile/password", {
          method: "PUT",
          body: JSON.stringify({ password: formValues.password }),
        });
        setSaveMessage({ kind: "ok", text: "Password changed successfully." });
      } else {
        const updates: Record<string, string> = {};
        updates[field] = formValues[field] ?? "";
        await apiRequest("/dashboard/student/profile", {
          method: "PUT",
          body: JSON.stringify(updates),
        });
        setSaveMessage({ kind: "ok", text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated.` });
        const refreshed = await apiRequest<any>("/dashboard/student/profile");
        if (refreshed.student) setProfile(refreshed.student);
      }
      setEditField(null);
      setFormValues({});
    } catch (err) {
      setSaveMessage({
        kind: "bad",
        text: err instanceof Error ? err.message : "Update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setFormValues({});
    setSaveMessage(null);
  };

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="sa-alert-panel"><strong>Live data unavailable:</strong> {error}</div>;
  if (!profile) return null;

  const p = profile.student;
  const editable = profile.editable_fields;

  return (
    <>
      <section className="sa-card sa-card-hover" aria-labelledby="details-h">
        <div className="sa-card-heading">
          <div>
            <h3 id="details-h">Profile</h3>
            <p>Your college details. Only phone and email can be edited here.</p>
          </div>
        </div>

        <div className="sa-student-hero sa-card sa-card-hover" aria-label="Student profile">
          <div className="sa-student-photo" aria-hidden="true">{initialsOf(p)}</div>
          <div className="sa-student-intro">
            <span className="sa-chip">{String(p.status || "active").toUpperCase()}</span>
            <h2>{p.full_name}</h2>
            <p>{[p.program, p.level_number ? `Level ${p.level_number}` : null].filter(Boolean).join(" · ") || "Program not assigned"}</p>
            <div className="sa-student-meta">
              <span>Student ID <b>{p.student_number}</b></span>
              <span>·</span>
              <span>Department <b>{p.department || "—"}</b></span>
              <span>·</span>
              <span>Status <span className="sa-badge success">{p.status}</span></span>
            </div>
          </div>
        </div>

        <table className="sa-table sa-st-restable" role="region" aria-label="Student profile details">
          <thead>
            <tr>
              <th scope="col">Detail</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Detail">Student ID</td>
              <td data-label="Value">{p.student_number}</td>
            </tr>
            <tr>
              <td data-label="Detail">Full name</td>
              <td data-label="Value">{p.full_name}</td>
            </tr>
            <tr>
              <td data-label="Detail">Program</td>
              <td data-label="Value">{p.program}</td>
            </tr>
            <tr>
              <td data-label="Detail">Department</td>
              <td data-label="Value">{p.department || "Not assigned"}</td>
            </tr>
            <tr>
              <td data-label="Detail">Level</td>
              <td data-label="Value">{p.level_number ? `Level ${p.level_number}` : "—"}</td>
            </tr>
            <tr>
              <td data-label="Detail">Enrollment year</td>
              <td data-label="Value">{p.enrollment_year ?? "—"}</td>
            </tr>
            <tr>
              <td data-label="Detail">Status</td>
              <td data-label="Value">
                <span className="sa-badge success">{p.status}</span>
              </td>
            </tr>
            <tr>
              <td data-label="Detail">Email</td>
              <td data-label="Value">
                {editField === "email" ? (
                  <div className="sa-st-inline-edit">
                    <input
                      className="sa-select"
                      value={formValues.email ?? ""}
                      onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                      autoFocus
                    />
                    <div className="sa-inline-actions">
                      <button type="button" className="sa-button sa-button-primary" onClick={() => handleSave("email")} disabled={saving}>
                        Save
                      </button>
                      <button type="button" className="sa-button sa-button-outline" onClick={handleCancel}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {p.email}
                    {editable.includes("email") && (
                      <button type="button" className="sa-link-button" onClick={() => { setFormValues({ email: p.email ?? "" }); setEditField("email"); }}>
                        Edit
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
            <tr>
              <td data-label="Detail">Phone</td>
              <td data-label="Value">
                {editField === "phone" ? (
                  <div className="sa-st-inline-edit">
                    <input
                      className="sa-select"
                      value={formValues.phone ?? ""}
                      onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                      autoFocus
                    />
                    <div className="sa-inline-actions">
                      <button type="button" className="sa-button sa-button-primary" onClick={() => handleSave("phone")} disabled={saving}>
                        Save
                      </button>
                      <button type="button" className="sa-button sa-button-outline" onClick={handleCancel}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {p.phone}
                    {editable.includes("phone") && (
                      <button type="button" className="sa-link-button" onClick={() => { setFormValues({ phone: p.phone ?? "" }); setEditField("phone"); }}>
                        Edit
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
            <tr>
              <td data-label="Detail">Date of birth</td>
              <td data-label="Value">{formatDate(p.date_of_birth)}</td>
            </tr>
            <tr>
              <td data-label="Detail">Gender</td>
              <td data-label="Value">{p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : "—"}</td>
            </tr>
          </tbody>
        </table>

        <p className="sa-st-note">
          Corrections to your name, program, department or other official details cannot be made here — please contact
          the registrar's office to request those changes.
        </p>
      </section>

      {editable.includes("password") && (
        <section className="sa-card sa-card-hover" aria-labelledby="password-h">
          <div className="sa-card-heading">
            <div>
              <h3 id="password-h">Change password</h3>
              <p>Minimum 8 characters.</p>
            </div>
          </div>
          <div className="sa-st-inline-edit">
            <input
              className="sa-select"
              type={passwordVisible ? "text" : "password"}
              value={formValues.password ?? ""}
              onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
              placeholder="New password"
              autoFocus
            />
            <button
              type="button"
              className="sa-link-button"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
            <div className="sa-inline-actions">
              <button type="button" className="sa-button sa-button-primary" onClick={() => handleSave("password")} disabled={saving}>
                Change password
              </button>
              <button type="button" className="sa-button sa-button-outline" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </section>
      )}

      {saveMessage && (
        <div className={`sa-alert-panel ${saveMessage.kind === "ok" ? "sa-st-ok" : "sa-st-bad"}`}>
          {saveMessage.text}
        </div>
      )}

      <section className="sa-card sa-card-hover" aria-labelledby="logout-h">
        <div className="sa-card-heading">
          <div><h3 id="logout-h">Account</h3><p>Sign out of the student portal.</p></div>
        </div>
        <button type="button" className="sa-logout-btn" onClick={() => {
          localStorage.removeItem("collegeAuthToken");
          localStorage.removeItem("collegeUser");
          sessionStorage.removeItem("collegeSessionToken");
          sessionStorage.removeItem("collegeUser");
          window.location.href = "/login";
        }}>
          <LogOut size={14} /> Logout
        </button>
      </section>
    </>
  );
}
