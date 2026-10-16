"use client";

import { useState } from "react";

export const PAGE_SIZES = [10, 25, 50, 100];

// Page number and "rows per page" state for a list held in memory.
export function usePaging(total: number) {
  const [page, setPage] = useState(1);
  const [pageSize, setSize] = useState(PAGE_SIZES[0]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  // After deleting the last row of the last page, fall back to the new last page.
  const current = Math.min(page, pageCount);

  function changeSize(size: number) {
    setSize(size);
    setPage(1);
  }

  return {
    page: current,
    pageSize,
    pageCount,
    setPage,
    setPageSize: changeSize,
    slice: <T,>(rows: T[]) => rows.slice((current - 1) * pageSize, current * pageSize),
  };
}

// 1 … 4 5 [6] 7 8 … 20
function pageWindow(page: number, total: number): (number | "gap")[] {
  const keep = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

export function Pager({
  total,
  page,
  pageSize,
  pageCount,
  onPage,
  onPageSize,
  noun = "items",
}: {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
  noun?: string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn = "min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 p-4 text-sm text-zinc-600">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing <strong className="text-zinc-900">{from}–{to}</strong> of <strong className="text-zinc-900">{total}</strong> {noun}
        </span>
        <label className="flex items-center gap-2">
          <span className="text-zinc-500">Show</span>
          <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand">
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s} per page</option>
            ))}
          </select>
        </label>
      </div>
      {pageCount > 1 && (
        <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
          <button type="button" className={btn} disabled={page === 1} onClick={() => onPage(page - 1)}>‹ Prev</button>
          {pageWindow(page, pageCount).map((n, i) =>
            n === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-zinc-400" aria-hidden>…</span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onPage(n)}
                aria-current={n === page ? "page" : undefined}
                className={`${btn} ${n === page ? "bg-brand text-white ring-brand hover:bg-brand" : ""}`}
              >
                {n}
              </button>
            ),
          )}
          <button type="button" className={btn} disabled={page === pageCount} onClick={() => onPage(page + 1)}>Next ›</button>
        </nav>
      )}
    </div>
  );
}
