"use client";

import Link, { useLinkStatus } from "next/link";

// Shows a spinner inside the tab that was just clicked while its report loads.
function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span aria-hidden className="ml-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]" /> : null;
}

export function RangeTabs({ ranges, active }: { ranges: number[]; active: number }) {
  return (
    <div className="flex gap-1 rounded-lg bg-white p-1 ring-1 ring-black/10">
      {ranges.map((r) => (
        <Link
          key={r}
          href={`/dashboard/insights?days=${r}`}
          aria-current={active === r ? "page" : undefined}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${active === r ? "bg-brand text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
        >
          {r} days
          <Pending />
        </Link>
      ))}
    </div>
  );
}
