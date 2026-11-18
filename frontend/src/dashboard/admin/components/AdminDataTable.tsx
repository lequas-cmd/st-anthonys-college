import React, { useMemo, useState } from "react";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
};

type Props<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  rows: T[];
  emptyLabel?: string;
  pageSize?: number;
  selectable?: boolean;
  onBulkAction?: (selected: T[]) => void;
  bulkActionLabel?: string;
  onExport?: (rows: T[]) => void;
  getRowId?: (row: T, index: number) => string | number;
};

export default function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyLabel = "No records available.",
  pageSize = 10,
  selectable = false,
  onBulkAction,
  bulkActionLabel = "Delete selected",
  onExport,
  getRowId,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const rowId = (row: T, index: number) => (getRowId ? getRowId(row, index) : index);

  const toggleSelect = (id: string | number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((r, i) => rowId(r, i))));
  };

  const selectedRows = rows.filter((r, i) => selected.has(rowId(r, i)));

  return (
    <div>
      <div className="sa-table-wrap">
        <table className="sa-table sa-admin-table">
          <thead>
            <tr>
              {selectable ? (
                <th>
                  <input type="checkbox" checked={paged.length > 0 && selected.size === paged.length} onChange={toggleAll} />
                </th>
              ) : null}
              {columns.map((column) => (
                <th key={column.key}>
                  {column.sortable ? (
                    <button
                      type="button"
                      className="sa-link-button"
                      onClick={() => {
                        if (sortKey === column.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else { setSortKey(column.key); setSortDir("asc"); }
                      }}
                    >
                      {column.label} {sortKey === column.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length ? (
              paged.map((row, index) => {
                const id = rowId(row, index);
                return (
                  <tr key={id}>
                    {selectable ? (
                      <td>
                        <input type="checkbox" checked={selected.has(id)} onChange={() => toggleSelect(id)} />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td key={`${column.key}-${id}`} className={column.className}>
                        {column.render ? column.render(row) : String(row[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>{emptyLabel}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="sa-table-footer">
        <span>
          {sorted.length} records · page {currentPage} of {totalPages}
        </span>
        <span className="sa-inline-actions">
          {selectable && selected.size > 0 && onBulkAction ? (
            <button type="button" className="sa-button sa-button-outline" onClick={() => onBulkAction(selectedRows)}>
              {bulkActionLabel} ({selected.size})
            </button>
          ) : null}
          {onExport ? (
            <button type="button" className="sa-button sa-button-outline" onClick={() => onExport(sorted)}>
              Export
            </button>
          ) : null}
          <button
            type="button"
            className="sa-button sa-button-outline"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="sa-button sa-button-outline"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </span>
      </div>
    </div>
  );
}