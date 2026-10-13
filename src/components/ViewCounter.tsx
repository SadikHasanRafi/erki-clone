"use client";

import { useEffect, useRef, useState } from "react";

// Counts one view per page load. If the request fails, the server-rendered count stays on screen.
export function ViewCounter({ slug, initial }: { slug: string; initial: number }) {
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

  return <span>{views.toLocaleString("bn-BD")} views</span>;
}
