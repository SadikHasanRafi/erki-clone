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
