import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarItem, ItemKind, StudentSummary, WEEKDAYS_SHORT, addDays, buildOneOffItems, dateKey,
  expandClasses, formatClock, formatDate, formatDayLabel, kindLabel, sameDay, sortItems,
  startOfDay, startOfWeek,
} from "../utils/studentUtils";

type View = "month" | "week" | "day" | "agenda";
const VIEWS: Array<{ id: View; label: string }> = [
  { id: "month", label: "Month" }, { id: "week", label: "Week" }, { id: "day", label: "Day" }, { id: "agenda", label: "Agenda" },
];
const KINDS: ItemKind[] = ["class", "assessment", "assignment", "event"];
const FILTER_LABEL: Record<ItemKind, string> = { class: "Classes", assessment: "Assessments", assignment: "Assignments", event: "Events & dates" };

const timeLabel = (i: CalendarItem) =>
  i.allDay ? "All day" : i.end ? `${formatClock(i.start)}–${formatClock(i.end)}` : formatClock(i.start);

function ItemChip({ item, selected, onSelect }: { item: CalendarItem; selected: boolean; onSelect: (i: CalendarItem) => void }) {
  return (
    <button type="button" className={`sa-st-chip k-${item.kind}${selected ? " is-selected" : ""}`} onClick={() => onSelect(item)}
      aria-label={`${kindLabel[item.kind]}: ${item.title}, ${formatDayLabel(item.start)}, ${timeLabel(item)}`}>
      <span className="sa-st-chip-time">{item.allDay ? "" : formatClock(item.start)}</span>
      <span className="sa-st-chip-title">{item.title}</span>
    </button>
  );
}

function Details({ item, onClose }: { item: CalendarItem | null; onClose: () => void }) {
  if (!item) {
    return (
      <aside className="sa-panel sa-st-details" aria-live="polite">
        <h3>Details</h3>
        <p className="sa-st-empty">Select a class, assessment or event to see its details.</p>
      </aside>
    );
  }
  const rows: Array<[string, string | null | undefined]> = [
    ["Date", formatDate(item.start)],
    ["Time", timeLabel(item)],
    ["Course", item.course],
    ["Instructor", item.instructor],
    ["Location", item.location],
    ["Status", item.status],
  ];
  return (
    <aside className="sa-panel sa-st-details" aria-live="polite">
      <div className="sa-panel-heading">
        <h3>{item.title}</h3>
        <button type="button" className="sa-link-button" onClick={onClose} aria-label="Close details">Close ✕</button>
      </div>
      <p><span className={`sa-st-kind k-${item.kind}`}>{kindLabel[item.kind]}</span> <span className="sa-badge info">{item.recurring ? "Repeats weekly" : item.kind === "event" ? "One-time event" : "Due once"}</span></p>
      <dl className="sa-st-dl">
        {rows.filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
      {item.details ? <><h4>Instructions & notes</h4><p>{item.details}</p></> : <p className="sa-st-footnote">No additional instructions have been published for this item.</p>}
    </aside>
  );
}

export default function SchedulePage({ data }: { data: StudentSummary }) {
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [filters, setFilters] = useState<Set<ItemKind>>(new Set(KINDS));
  const [selected, setSelected] = useState<CalendarItem | null>(null);
  const [monthDay, setMonthDay] = useState<Date>(() => startOfDay(new Date()));
  const today = new Date();
  const detailsRef = useRef<HTMLDivElement>(null);

  const oneOff = useMemo(() => buildOneOffItems(data), [data]);

  // visible range for the active view
  const range = useMemo(() => {
    if (view === "month") {
      const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const gridStart = startOfWeek(first);
      const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const gridEnd = addDays(startOfWeek(last), 6);
      return { from: gridStart, to: gridEnd };
    }
    if (view === "week") return { from: startOfWeek(cursor), to: addDays(startOfWeek(cursor), 6) };
    if (view === "day") return { from: cursor, to: cursor };
    return { from: cursor, to: addDays(cursor, 29) };
  }, [view, cursor]);

  const items = useMemo(() => {
    const classes = expandClasses(data.schedule, range.from, range.to);
    const others = oneOff.filter((i) => startOfDay(i.start) >= range.from && startOfDay(i.start) <= range.to);
    return sortItems([...classes, ...others]).filter((i) => filters.has(i.kind));
  }, [data.schedule, oneOff, range, filters]);

  const byDay = (d: Date) => items.filter((i) => sameDay(i.start, d));

  const step = (dir: -1 | 1) => {
    if (view === "month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
    else if (view === "week") setCursor(addDays(cursor, 7 * dir));
    else if (view === "day") setCursor(addDays(cursor, dir));
    else setCursor(addDays(cursor, 30 * dir));
  };

  const title = view === "month" ? cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : view === "week" ? `${formatDayLabel(range.from)} – ${formatDayLabel(range.to)}, ${range.to.getFullYear()}`
    : view === "day" ? cursor.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : `Next 30 days from ${formatDayLabel(cursor)}`;

  const toggle = (k: ItemKind) => setFilters((cur) => { const n = new Set(cur); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const select = (i: CalendarItem) => { setSelected(i); if (window.matchMedia("(max-width: 900px)").matches) setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0); };
  const goToday = () => { setCursor(startOfDay(new Date())); setMonthDay(startOfDay(new Date())); };

  useEffect(() => { setSelected(null); }, [view]);

  const renderDayList = (d: Date) => {
    const list = byDay(d);
    return list.length ? list.map((i) => <ItemChip key={i.id} item={i} selected={selected?.id === i.id} onSelect={select} />) : <span className="sa-st-none">Nothing scheduled</span>;
  };

  const noData = data.schedule.length === 0 && oneOff.length === 0;

  return (
    <div className="sa-st-calendar">
      <div className="sa-panel sa-st-toolbar">
        <div className="sa-st-nav" role="group" aria-label="Calendar navigation">
          <button type="button" className="sa-button sa-button-outline" onClick={() => step(-1)} aria-label="Previous">‹</button>
          <button type="button" className="sa-button sa-button-outline" onClick={goToday}>Today</button>
          <button type="button" className="sa-button sa-button-outline" onClick={() => step(1)} aria-label="Next">›</button>
          <button type="button" className="sa-button sa-button-outline" onClick={() => { setView("week"); goToday(); }}>This week</button>
          <input className="sa-select sa-st-datepick" type="date" aria-label="Go to date" value={dateKey(cursor)}
            onChange={(e) => { if (e.target.value) { const [y, m, d] = e.target.value.split("-").map(Number); const nd = new Date(y, m - 1, d); setCursor(nd); setMonthDay(nd); } }} />
        </div>
        <h2 className="sa-st-caltitle" aria-live="polite">{title}</h2>
        <div className="sa-st-seg" role="group" aria-label="Calendar view">
          {VIEWS.map((v) => <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>)}
        </div>
      </div>

      <div className="sa-st-filters" role="group" aria-label="Filter by type (also the legend)">
        {KINDS.map((k) => (
          <button key={k} type="button" className={`sa-st-filter k-${k}`} aria-pressed={filters.has(k)} onClick={() => toggle(k)}>
            <i aria-hidden="true" />{FILTER_LABEL[k]}
          </button>
        ))}
        <span className="sa-st-footnote">Classes repeat weekly; other items are one-time.</span>
      </div>

      {noData && <p className="sa-panel sa-st-empty">No schedule or calendar data has been published for your account yet.</p>}

      <div className="sa-st-calbody">
        <div className="sa-panel sa-st-flush sa-st-main">
          {view === "month" && (
            <>
              <div className="sa-st-month" role="grid" aria-label={title}>
                {WEEKDAYS_SHORT.map((d) => <div key={d} className="sa-st-monthhead" role="columnheader">{d}</div>)}
                {Array.from({ length: Math.round((range.to.getTime() - range.from.getTime()) / 86400000) + 1 }, (_, n) => {
                  const d = addDays(range.from, n);
                  const list = byDay(d);
                  const out = d.getMonth() !== cursor.getMonth();
                  return (
                    <div key={dateKey(d)} role="gridcell" className={`sa-st-monthcell${out ? " is-out" : ""}${sameDay(d, today) ? " is-today" : ""}${sameDay(d, monthDay) ? " is-picked" : ""}`}>
                      <button type="button" className="sa-st-daynum" aria-label={`${formatDayLabel(d)}, ${list.length} items`} onClick={() => setMonthDay(d)} onDoubleClick={() => { setCursor(d); setView("day"); }}>{d.getDate()}</button>
                      <div className="sa-st-monthitems">
                        {list.slice(0, 3).map((i) => <ItemChip key={i.id} item={i} selected={selected?.id === i.id} onSelect={select} />)}
                        {list.length > 3 && <button type="button" className="sa-st-more" onClick={() => setMonthDay(d)}>+{list.length - 3} more</button>}
                      </div>
                      {list.length > 0 && <div className="sa-st-dots" aria-hidden="true">{list.slice(0, 4).map((i) => <i key={i.id} className={`k-${i.kind}`} />)}</div>}
                    </div>
                  );
                })}
              </div>
              <div className="sa-st-dayplan">
                <h3>{formatDayLabel(monthDay)}</h3>
                <div className="sa-st-dayplan-list">{(() => {
                  const list = items.filter((i) => sameDay(i.start, monthDay));
                  return list.length ? list.map((i) => <ItemChip key={i.id} item={i} selected={selected?.id === i.id} onSelect={select} />) : <span className="sa-st-none">Nothing scheduled</span>;
                })()}</div>
              </div>
            </>
          )}

          {view === "week" && (
            <div className="sa-st-week">
              {Array.from({ length: 7 }, (_, i) => addDays(range.from, i)).map((d) => (
                <section key={dateKey(d)} className={`sa-st-weekcol${sameDay(d, today) ? " is-today" : ""}`} aria-label={formatDayLabel(d)}>
                  <header><b>{WEEKDAYS_SHORT[(d.getDay() + 6) % 7]}</b> <span>{d.getDate()}</span></header>
                  <div className="sa-st-weekitems">{renderDayList(d)}</div>
                </section>
              ))}
            </div>
          )}

          {view === "day" && (
            <ul className="sa-st-timeline">
              {byDay(cursor).length === 0 && <li className="sa-st-empty">Nothing scheduled for this day.</li>}
              {byDay(cursor).map((i) => (
                <li key={i.id}>
                  <span className="sa-st-timeline-time">{timeLabel(i)}</span>
                  <ItemChip item={i} selected={selected?.id === i.id} onSelect={select} />
                  <small>{[i.course, i.location].filter(Boolean).join(" · ")}</small>
                </li>
              ))}
            </ul>
          )}

          {view === "agenda" && (
            <div className="sa-st-agenda">
              {items.length === 0 && <p className="sa-st-empty">No activities in this period.</p>}
              {Array.from(new Set(items.map((i) => dateKey(i.start)))).map((key) => {
                const list = items.filter((i) => dateKey(i.start) === key);
                return (
                  <section key={key}>
                    <h3>{formatDate(list[0].start)} <small>{list[0].start.toLocaleDateString("en-GB", { weekday: "long" })}</small></h3>
                    {list.map((i) => (
                      <div key={i.id} className="sa-st-agendarow"><span>{timeLabel(i)}</span><ItemChip item={i} selected={selected?.id === i.id} onSelect={select} /></div>
                    ))}
                  </section>
                );
              })}
            </div>
          )}
        </div>
        <div ref={detailsRef}><Details item={selected} onClose={() => setSelected(null)} /></div>
      </div>
    </div>
  );
}
