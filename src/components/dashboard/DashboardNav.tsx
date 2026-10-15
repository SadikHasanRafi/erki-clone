"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "All memes" },
  { href: "/dashboard/homepage", label: "Homepage" },
  { href: "/dashboard/pages", label: "Pages" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/insights", label: "Insights" },
];

export function DashboardNav({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  // "All memes" also owns the edit pages (/dashboard/<id>) and "New meme" is highlighted on its own.
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard" || (pathname.startsWith("/dashboard/") && !LINKS.slice(1).some((l) => pathname.startsWith(l.href)) && pathname !== "/dashboard/new")
      : pathname.startsWith(href);

  return (
    <>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={isActive(l.href) ? "page" : undefined}
          className={`rounded px-2 py-1 ${isActive(l.href) ? "bg-white/15 font-semibold text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
        >
          {l.label}
          {l.href === "/dashboard/messages" && unread > 0 && (
            <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
          )}
        </Link>
      ))}
      <Link
        href="/dashboard/new"
        aria-current={pathname === "/dashboard/new" ? "page" : undefined}
        className={`rounded bg-accent px-3 py-1.5 font-semibold hover:opacity-90 ${pathname === "/dashboard/new" ? "ring-2 ring-white" : ""}`}
      >
        + New meme
      </Link>
    </>
  );
}
