"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/components/site/SettingsProvider";

// Counts one view per page load. If the request fails, the server-rendered count stays on screen.
export function ViewCounter({ slug, initial }: { slug: string; initial: number }) {
  const { labels, display } = useSettings();
  const [views, setViews] = useState(initial);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return; // guards against the double effect run in React strict mode
    counted.current = true;
    fetch(`/api/memes/${encodeURIComponent(slug)}/view`, { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.views) setViews(data.views);
      })
      .catch(() => {});
  }, [slug]);

  // The view is still counted when the number is hidden from readers.
  if (!display.showPostViews) return null;
  return <span> · {views.toLocaleString("en")} {labels.views}</span>;
}
