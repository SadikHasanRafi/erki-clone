"use client";

import Link from "next/link";
import { useLabels } from "./SettingsProvider";

// Numbered links with the current page in the middle: 1 … 4 5 [6] 7 8 … 20
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

export function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  const L = useLabels();
  if (totalPages <= 1) return null;

  const href = (n: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (n > 1) sp.set("page", String(n));
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  };
  const base = "min-w-9 rounded-full border border-hairline bg-white px-3 py-1.5 text-center font-display text-xs font-semibold";

  return (
    <nav aria-label="Pagination" className="col-span-full flex flex-wrap items-center justify-center gap-1.5 pt-2">
      {page > 1 && <Link href={href(page - 1)} className={`${base} hover:bg-subtle`}>{L.prev}</Link>}
      {pageWindow(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-neutral-400" aria-hidden>…</span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${base} ${n === page ? "border-ink bg-ink text-white" : "hover:bg-subtle"}`}
          >
            {n}
          </Link>
        ),
      )}
      {page < totalPages && <Link href={href(page + 1)} className={`${base} hover:bg-subtle`}>{L.next}</Link>}
    </nav>
  );
}
