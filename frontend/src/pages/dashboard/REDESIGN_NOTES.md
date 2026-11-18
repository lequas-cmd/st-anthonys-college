# Dashboard redesign – notes

Scope: **styling only.** Every `.tsx` / `.ts` file is byte-identical to the original
(no props, handlers, API calls, ids, data attributes or inline data-driven styles touched).
Only `Styles/shared.css` and `Styles/student.css` were rewritten; all existing class names are preserved.

## What was wrong
- Variables used but never defined: `--r-sm`, `--r-md`, `--r-lg`, `--sa-surface-2` (radii and hover/active fills silently failed).
- Two parallel token sets (`--sa-*`, `--st-*`) with duplicated values; legacy 8–10px text and Georgia headings
  under an override layer scoped by `:has()`.
- Sidebar text was `#626260` on `#111` (≈3:1 contrast).
- `.sa-task-row` used a 3-column grid, so rows with no icon (the empty states) collapsed into a 40px column.
- No styles for the notification cards or skeleton loader classes the pages already render.
- Radii 20/28px and tracked all-caps eyebrows contradicted DESIGN.md.

## What it is now
- **One token set** (`--ds-*`) taken from DESIGN.md; legacy `--sa-*`, `--st-*`, `--r-*` names alias to it so nothing else breaks.
- Cream canvas, white hairline cards (12px), 16px hero/modal, 8px controls, 4px badges. No drop shadows.
- Single family (Inter standing in for Saans), weights 400/500, DESIGN.md type scale, tabular figures on all numbers.
- 4/8 spacing scale; 1280px content width; 56px topbar.
- Sidebar moved to the cream canvas, active item lifts onto white. The charcoal hero is the only inverted surface.
- Tables bleed to the card edge (header band, row hover, compact in-table buttons), sticky first column preserved.
- Semantic colours derived from the report palette, with darker text tones so badges meet 4.5:1.
- Skeleton shimmer, notification cards, focus rings, hover/active transitions.
- Responsive: 1100 / 768 / 480; drawer nav with `visibility` handling; 44px / 16px inputs on mobile; resources table still collapses to labelled rows.
- `prefers-reduced-motion`, `prefers-contrast: more`, `forced-colors` and print preserved.

## Things worth knowing
- Eyebrows/roles keep their uppercase strings in the TSX; CSS renders them in sentence case.
- Inter is loaded from Google Fonts as before; swap `--ds-font` if you self-host Saans.
- `student/pages/OverviewPage.tsx` renders **hard-coded sample notifications** ("Second installment is due on Oct 15"…).
  That is content, not styling, so I left it alone, but it will show to real students.
