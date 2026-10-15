"use client";

import { useEffect, useState } from "react";
import { formatCompact } from "@/lib/format";
import { Icon } from "./Icon";
import { useSettings } from "./SettingsProvider";

const SESSION_KEY = "amiami-visit-counted";

// Shared by every counter on the page, so the header and footer make one request between them.
let visitRequest: Promise<number | null> | null = null;

// A visit is counted once per browser tab session; later page loads only read the total.
function loadVisits(): Promise<number | null> {
  if (!visitRequest) {
    let counted = false;
    try {
      counted = sessionStorage.getItem(SESSION_KEY) === "1";
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Storage blocked (private mode): count this load and move on.
    }
    visitRequest = fetch("/api/visit", { method: counted ? "GET" : "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { visits?: number } | null) => data?.visits ?? null)
      .catch(() => null);
  }
  return visitRequest;
}

export function SiteVisits({ className = "" }: { className?: string }) {
  const { labels, display } = useSettings();
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    loadVisits().then((v) => live && setVisits(v));
    return () => {
      live = false;
    };
  }, []);

  if (!display.showSiteVisits || visits === null) return null;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={`${visits.toLocaleString("en")} ${labels.visits}`}>
      <Icon name="users" className="h-3.5 w-3.5" />
      {formatCompact(visits)} {labels.visits}
    </span>
  );
}
