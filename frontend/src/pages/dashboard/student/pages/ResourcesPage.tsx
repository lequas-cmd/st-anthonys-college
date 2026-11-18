import React, { useMemo, useState } from "react";
import { ResourceItem, StudentSummary, formatDate, formatSize, parseDate, resourceType } from "../utils/studentUtils";

type Props = { data: StudentSummary; onNotify: (message: string) => void };
type Sort = "title" | "newest" | "category";

export default function ResourcesPage({ data, onNotify }: Props) {
  const list = data.resources;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [course, setCourse] = useState("All");
  const [uploader, setUploader] = useState("All");
  const [sort, setSort] = useState<Sort>("title");
  const [grouped, setGrouped] = useState(true);

  // Optional columns appear only when the backend supplies the data.
  const hasCourse = list.some((r) => r.course_code);
  const hasUploader = list.some((r) => r.uploaded_by);
  const hasDate = list.some((r) => r.updated_at);
  const hasSize = list.some((r) => r.file_size_bytes);

  const options = (pick: (r: ResourceItem) => string | null | undefined) => ["All", ...Array.from(new Set(list.map(pick).filter(Boolean) as string[]))];
  const categories = useMemo(() => options((r) => r.category), [list]); // eslint-disable-line react-hooks/exhaustive-deps
  const types = useMemo(() => options((r) => resourceType(r.file_url)?.label ?? "Unavailable"), [list]); // eslint-disable-line react-hooks/exhaustive-deps
  const courses = useMemo(() => options((r) => r.course_code), [list]); // eslint-disable-line react-hooks/exhaustive-deps
  const uploaders = useMemo(() => options((r) => r.uploaded_by), [list]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = list.filter((r) =>
      (category === "All" || r.category === category) &&
      (type === "All" || (resourceType(r.file_url)?.label ?? "Unavailable") === type) &&
      (course === "All" || r.course_code === course) &&
      (uploader === "All" || r.uploaded_by === uploader) &&
      (!q || `${r.title} ${r.description ?? ""} ${r.category} ${r.course_code ?? ""}`.toLowerCase().includes(q)));
    return out.sort((a, b) => {
      if (sort === "newest") return (parseDate(b.updated_at)?.getTime() ?? 0) - (parseDate(a.updated_at)?.getTime() ?? 0);
      if (sort === "category") return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });
  }, [list, query, category, type, course, uploader, sort]);

  const groups = useMemo(() => {
    if (!grouped) return [{ name: "", items: shown }];
    const m = new Map<string, ResourceItem[]>();
    shown.forEach((r) => m.set(r.category, [...(m.get(r.category) ?? []), r]));
    return Array.from(m, ([name, items]) => ({ name, items }));
  }, [shown, grouped]);

  const clear = () => { setQuery(""); setCategory("All"); setType("All"); setCourse("All"); setUploader("All"); };
  const filtersActive = query || category !== "All" || type !== "All" || course !== "All" || uploader !== "All";
  const colCount = 4 + Number(hasCourse) + Number(hasUploader) + Number(hasDate);

  const action = (r: ResourceItem) => {
    const t = resourceType(r.file_url);
    if (!r.file_url || !t) return <span className="sa-badge warning" title="This file has not been uploaded or is currently unavailable. Contact the instructor.">Unavailable</span>;
    return (
      <a className="sa-button sa-button-primary sa-st-getbtn" href={r.file_url} target="_blank" rel="noreferrer" {...(t.external ? {} : { download: true })}
        onClick={() => onNotify(t.external ? `Opening “${r.title}” in a new tab.` : `Download started: ${r.title}. If nothing happens, check your browser’s download settings.`)}
        aria-label={`${t.external ? "Open" : "Download"} ${r.title}`}>
        {t.external ? "↗ Open link" : "⇩ Download"}
      </a>
    );
  };

  return (
    <section className="sa-panel sa-st-flush" aria-labelledby="res-h">
      <div className="sa-st-restools sa-st-padded">
        <div className="sa-panel-heading"><div><h3 id="res-h">Learning resources</h3><p>{shown.length} of {list.length} resources</p></div></div>
        <div className="sa-st-filterrow">
          <label className="sa-search sa-st-grow">⌕ <input type="search" aria-label="Search resources" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or keyword" /></label>
          <select className="sa-select" aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}</select>
          <select className="sa-select" aria-label="File type" value={type} onChange={(e) => setType(e.target.value)}>{types.map((c) => <option key={c} value={c}>{c === "All" ? "All types" : c}</option>)}</select>
          {hasCourse && <select className="sa-select" aria-label="Course" value={course} onChange={(e) => setCourse(e.target.value)}>{courses.map((c) => <option key={c} value={c}>{c === "All" ? "All courses" : c}</option>)}</select>}
          {hasUploader && <select className="sa-select" aria-label="Uploader" value={uploader} onChange={(e) => setUploader(e.target.value)}>{uploaders.map((c) => <option key={c} value={c}>{c === "All" ? "All uploaders" : c}</option>)}</select>}
          <select className="sa-select" aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="title">Sort: Title</option><option value="category">Sort: Category</option>{hasDate && <option value="newest">Sort: Newest</option>}
          </select>
          <label className="sa-st-check"><input type="checkbox" checked={grouped} onChange={(e) => setGrouped(e.target.checked)} /> Group by category</label>
        </div>
      </div>

      {list.length === 0 ? <p className="sa-st-empty">No resources have been shared with you yet.</p> : shown.length === 0 ? (
        <div className="sa-st-empty"><p>No resources match your search or filters.</p>{filtersActive && <button type="button" className="sa-button sa-button-outline" onClick={clear}>Clear filters</button>}</div>
      ) : (
        <div className="sa-table-wrap" tabIndex={0} role="region" aria-label="Resources">
          <table className="sa-table sa-st-table sa-st-restable">
            <thead><tr><th scope="col">Resource</th>{hasCourse && <th scope="col">Course</th>}<th scope="col">Category</th><th scope="col">Type</th>{hasUploader && <th scope="col">Uploaded by</th>}{hasDate && <th scope="col">Updated</th>}<th scope="col"><span className="sa-st-sr">Action</span></th></tr></thead>
            {groups.map((g) => (
              <tbody key={g.name || "all"}>
                {grouped && <tr className="sa-st-grouphead"><th scope="colgroup" colSpan={colCount}>{g.name} <small>({g.items.length})</small></th></tr>}
                {g.items.map((r) => {
                  const t = resourceType(r.file_url);
                  return (
                    <tr key={r.id}>
                      <td data-label="Resource"><strong>{r.title}</strong>{r.description && <small className="sa-st-desc">{r.description}</small>}</td>
                      {hasCourse && <td data-label="Course">{r.course_code || "General"}</td>}
                      <td data-label="Category">{r.category}</td>
                      <td data-label="Type">{t ? <>{t.label}{!t.external && hasSize && formatSize(r.file_size_bytes) ? ` · ${formatSize(r.file_size_bytes)}` : ""}{t.external && <small className="sa-st-block">External link</small>}</> : "—"}</td>
                      {hasUploader && <td data-label="Uploaded by">{r.uploaded_by || "—"}</td>}
                      {hasDate && <td data-label="Updated">{r.updated_at ? formatDate(r.updated_at) : "—"}</td>}
                      <td data-label="">{action(r)}</td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </section>
  );
}
