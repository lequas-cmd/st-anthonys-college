import React, { useMemo, useState } from "react";
import {
  CourseGrade, PASS_MARK, StudentSummary, average, currentTermIsExplicit, downloadCsv, formatDate,
  formatPercent, gradeStatus, gradeStatusLabel, letterGrade, selectCurrentCourses,
} from "../utils/studentUtils";

type Props = { data: StudentSummary; courses: CourseGrade[]; onNotify: (message: string) => void };

const CURRENT = "Current semester";
const ALL = "All terms";

function CourseBars({ courses }: { courses: CourseGrade[] }) {
  const rows = courses.filter((c) => c.percent !== null);
  if (!rows.length) return <p className="sa-st-empty">No graded results to compare yet.</p>;
  return (
    <ul className="sa-st-bars" aria-label="Course results as a percentage of graded work">
      {rows.map((c) => {
        const p = Math.round(c.percent as number);
        return (
          <li key={`${c.code}-${c.term}`} title={`${c.course}: ${p}% of graded work (${c.gradedCount}/${c.assessments.length} assessments graded)`}>
            <span className="sa-st-bar-label"><b>{c.code}</b><small>{c.course}</small></span>
            <span className="sa-st-bar-track" aria-hidden="true">
              <i className={p >= PASS_MARK ? "ok" : "low"} style={{ width: `${Math.min(100, p)}%` }} />
              <em style={{ left: `${PASS_MARK}%` }} />
            </span>
            <span className="sa-st-bar-value">{p}%</span>
          </li>
        );
      })}
      <li className="sa-st-bar-axis" aria-hidden="true"><span /><span className="sa-st-bar-scale"><small>0</small><small style={{ left: `${PASS_MARK}%` }}>pass {PASS_MARK}</small><small>100</small></span><span /></li>
    </ul>
  );
}

function TrendChart({ courses }: { courses: CourseGrade[] }) {
  const points = useMemo(() => {
    const list: Array<{ t: number; pct: number; label: string }> = [];
    courses.forEach((c) => c.assessments.forEach((a) => {
      if (a.score !== null && a.due) list.push({ t: a.due.getTime(), pct: (a.score / a.max) * 100, label: `${c.code} · ${a.title}: ${a.score}/${a.max} (${Math.round((a.score / a.max) * 100)}%) on ${formatDate(a.due)}` });
    }));
    return list.sort((a, b) => a.t - b.t);
  }, [courses]);
  if (points.length < 2) return <p className="sa-st-empty">The trend appears once at least two graded assessments have due dates.</p>;

  const W = 560, H = 190, L = 34, R = 10, T = 10, B = 24;
  const x = (i: number) => L + (i * (W - L - R)) / (points.length - 1);
  const y = (p: number) => T + ((100 - p) * (H - T - B)) / 100;
  return (
    <svg className="sa-st-trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Assessment results over time, ${points.length} graded assessments`}>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}><line x1={L} x2={W - R} y1={y(g)} y2={y(g)} className={g === PASS_MARK ? "pass" : "grid"} /><text x={L - 6} y={y(g) + 3} textAnchor="end">{g}</text></g>
      ))}
      <polyline points={points.map((p, i) => `${x(i)},${y(p.pct)}`).join(" ")} className="line" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.pct)} r={4} tabIndex={0} className={p.pct >= PASS_MARK ? "ok" : "low"}><title>{p.label}</title></circle>
      ))}
      <text x={L} y={H - 6}>{formatDate(new Date(points[0].t))}</text>
      <text x={W - R} y={H - 6} textAnchor="end">{formatDate(new Date(points[points.length - 1].t))}</text>
    </svg>
  );
}

export default function GradeReportPage({ data, courses, onNotify }: Props) {
  const [term, setTerm] = useState(CURRENT);
  const terms = useMemo(() => Array.from(new Set(courses.map((c) => c.term))), [courses]);
  const explicit = currentTermIsExplicit(courses);
  const selected = useMemo(() => term === ALL ? courses : term === CURRENT ? selectCurrentCourses(courses) : courses.filter((c) => c.term === term), [courses, term]);
  const viewingPast = term !== CURRENT && term !== ALL;

  const semesterAvg = average(selected.map((c) => c.percent));
  const cumulativeAvg = average(courses.map((c) => c.percent));
  const completed = courses.filter((c) => c.complete).length;
  const inProgress = selected.filter((c) => !c.complete).length;
  const student = data.student!;
  const fullName = `${student.first_name} ${student.last_name}`.trim();
  const now = new Date();
  const termLabel = term === CURRENT ? (explicit ? CURRENT : "All published terms") : term;

  const exportCsv = () => {
    const rows: Array<Array<string | number>> = [
      ["Saint Anthony’s Technical and Vocational College — Student grade report (unofficial copy)"],
      ["Student", fullName], ["Student ID", student.student_number],
      ["Academic year", data.academic_year || student.academic_year || ""], ["Term", termLabel],
      ["Generated", now.toLocaleString("en-GB")],
      ["Grading", `Pass mark ${PASS_MARK}%. Course percentage = weighted result of graded assessments only.`],
      [],
      ["Course code", "Course", "Term", "Assessment", "Obtained", "Maximum", "Weight %", "Contribution", "Status"],
    ];
    selected.forEach((c) => {
      c.assessments.forEach((a) => rows.push([c.code, c.course, c.term, a.title, a.score ?? "", a.max, a.weight ?? "", a.score !== null && a.weight !== null ? ((a.score / a.max) * a.weight).toFixed(2) : "", gradeStatusLabel[gradeStatus(a, now)]]));
      rows.push([c.code, c.course, c.term, "COURSE TOTAL TO DATE", c.percent === null ? "" : c.earned.toFixed(2), c.gradedBasis, "", c.percent === null ? "" : `${c.percent.toFixed(1)}%`, c.complete ? "All graded" : "In progress"]);
    });
    downloadCsv(`grade-report-${student.student_number}-${now.toISOString().slice(0, 10)}.csv`, rows);
    onNotify("Grade report downloaded as an Excel-compatible CSV file.");
  };
  const printPdf = () => { onNotify("Opening print dialog — choose “Save as PDF”."); setTimeout(() => window.print(), 50); };

  return (
    <div className="sa-st-report">
      {/* shown only when printing */}
      <div className="sa-print-only sa-st-printhead">
        <h2>Saint Anthony’s Technical and Vocational College</h2>
        <p><b>Student grade report — unofficial student copy</b></p>
        <p>{fullName} · ID {student.student_number} · {data.academic_year || student.academic_year || ""} · {termLabel}</p>
        <p>Generated {now.toLocaleString("en-GB")} · Pass mark {PASS_MARK}%. This is not a certified transcript; official transcripts are issued by the Registrar’s office.</p>
      </div>

      <div className="sa-panel sa-st-toolbar sa-no-print">
        <label className="sa-st-field">Academic history
          <select className="sa-select" value={term} onChange={(e) => setTerm(e.target.value)}>
            <option>{CURRENT}</option><option>{ALL}</option>
            {terms.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <details className="sa-st-menu">
          <summary className="sa-button sa-button-primary">⇩ Export grade report</summary>
          <div role="menu">
            <button type="button" role="menuitem" onClick={exportCsv}>Excel-compatible (.csv)</button>
            <button type="button" role="menuitem" onClick={printPdf}>Print-ready PDF</button>
            <p>Unofficial student copy. Official transcripts require Registrar authorisation.</p>
          </div>
        </details>
      </div>

      {viewingPast && <p className="sa-st-note sa-no-print"><span>You are viewing a past term. Figures below do not include or affect your current semester.</span></p>}
      {term === CURRENT && !explicit && courses.length > 0 && <p className="sa-st-note sa-no-print"><span>No term is marked as the current semester in the records, so all published terms are shown.</span></p>}

      <div className="sa-stat-grid sa-st-summary">
        <article className="sa-stat-card"><div className="sa-stat-top"><span>{term === ALL ? "Average (selected terms)" : "Semester average"}</span></div><strong>{formatPercent(semesterAvg, 0)}</strong><p>{semesterAvg === null ? "No graded results yet" : `Grade ${letterGrade(semesterAvg)} · selection only`}</p></article>
        <article className="sa-stat-card"><div className="sa-stat-top"><span>Cumulative average</span></div><strong>{formatPercent(cumulativeAvg, 0)}</strong><p>All published terms; courses averaged equally (credit hours not available)</p></article>
        <article className="sa-stat-card"><div className="sa-stat-top"><span>Courses completed</span></div><strong>{completed}</strong><p>Every assessment graded</p></article>
        <article className="sa-stat-card"><div className="sa-stat-top"><span>In progress</span></div><strong>{inProgress}</strong><p>In the selected term(s)</p></article>
      </div>

      <div className="sa-st-grid2 sa-no-print">
        <section className="sa-panel"><div className="sa-panel-heading"><div><h3>Result by course</h3><p>Percentage of graded work · line marks the {PASS_MARK}% pass mark</p></div></div><CourseBars courses={selected} /></section>
        <section className="sa-panel"><div className="sa-panel-heading"><div><h3>Results over time</h3><p>Each point is one graded assessment (% of maximum)</p></div></div><TrendChart courses={selected} /></section>
      </div>

      <section className="sa-panel sa-st-flush" aria-labelledby="gd-h">
        <div className="sa-panel-heading sa-st-padded"><div><h3 id="gd-h">Detailed grades</h3><p>Contribution = obtained ÷ maximum × weight. Totals count graded assessments only.</p></div></div>
        {selected.length === 0 ? <p className="sa-st-empty">No grades are available for the selected term.</p> : (
          <div className="sa-table-wrap" tabIndex={0} role="region" aria-label="Detailed grades, scrollable">
            <table className="sa-table sa-st-table">
              <thead><tr><th scope="col">Assessment</th><th scope="col" className="sa-st-num">Obtained</th><th scope="col" className="sa-st-num">Max</th><th scope="col" className="sa-st-num">Weight</th><th scope="col" className="sa-st-num">Contribution</th><th scope="col">Due</th><th scope="col">Status</th></tr></thead>
              {selected.map((c) => (
                <tbody key={`${c.code}-${c.term}`}>
                  <tr className="sa-st-coursehead"><th scope="colgroup" colSpan={4}>{c.code} — {c.course}{term === ALL && <small> · {c.term}</small>}</th>
                    <td className="sa-st-num" colSpan={3}>{c.percent === null ? "No results yet" : <><b>{c.earned.toFixed(1)} / {c.gradedBasis.toFixed(0)}</b> · {formatPercent(c.percent, 0)} {c.complete ? "final" : "so far"} · grade {letterGrade(c.percent)}</>}</td></tr>
                  {c.assessments.map((a, i) => {
                    const st = gradeStatus(a, now);
                    return (
                      <tr key={i}>
                        <td>{a.title}</td>
                        <td className="sa-st-num">{a.score === null ? <span className="sa-st-pending">—</span> : <b>{a.score}</b>}</td>
                        <td className="sa-st-num">{a.max}</td>
                        <td className="sa-st-num">{a.weight === null ? "—" : `${a.weight}%`}</td>
                        <td className="sa-st-num">{a.score !== null && a.weight !== null ? ((a.score / a.max) * a.weight).toFixed(1) : "—"}</td>
                        <td>{a.due ? formatDate(a.due) : "—"}</td>
                        <td><span className={`sa-badge ${st === "published" ? "success" : st === "pending" ? "warning" : "info"}`}>{gradeStatusLabel[st]}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              ))}
            </table>
          </div>
        )}
        <p className="sa-st-footnote sa-st-padded">A dash means no result is available yet; it is not a score of zero.</p>
      </section>
    </div>
  );
}
