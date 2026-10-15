export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("bn-BD");
}

// Route params can arrive percent-encoded (Bangla slugs), so decode before the database lookup.
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

// 12400 -> "12.4k", the compact counters used across the public site.
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n).toLowerCase();
}

// "14 mins ago" style relative time; falls back to a short date after a week.
export function timeAgo(iso: string, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
}

// Rough reading time at ~200 words a minute, never less than one.
export function readMinutes(...texts: (string | undefined)[]): number {
  const words = texts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Picks one item per calendar day (UTC), rotating through the list.
export function pickOfTheDay<T>(items: T[], now = Date.now()): T | null {
  return items.length ? items[Math.floor(now / 86_400_000) % items.length] : null;
}
