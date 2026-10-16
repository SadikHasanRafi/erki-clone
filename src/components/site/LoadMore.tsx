"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Meme } from "@/lib/types";
import { VaultCard } from "./Cards";
import { useLabels } from "./SettingsProvider";

// Infinite scroll: with `auto` the next batch loads by itself when the reader nears the end of the list,
// and the button only appears if a request fails. Without `auto` (a list with more page content below it)
// the reader presses the button instead, so the rest of the page stays reachable.
export function LoadMore({
  initialSkip,
  pageSize,
  category,
  tag,
  q,
  excludeId,
  exclude,
  auto = true,
}: {
  initialSkip: number;
  pageSize: number;
  category?: string;
  tag?: string;
  q?: string;
  excludeId?: string;
  exclude?: string[];
  auto?: boolean;
}) {
  const L = useLabels();
  const [items, setItems] = useState<Meme[]>([]);
  const [skip, setSkip] = useState(initialSkip);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ skip: String(skip), limit: String(pageSize + 1) });
      if (category) params.set("category", category);
      if (tag) params.set("tag", tag);
      if (q) params.set("q", q);
      if (excludeId) params.set("excludeId", excludeId);
      if (exclude?.length) params.set("exclude", exclude.join(","));
      const res = await fetch(`/api/memes?${params}`);
      if (!res.ok) throw new Error(String(res.status));
      const { memes } = (await res.json()) as { memes: Meme[] };
      const page = memes.slice(0, pageSize);
      setItems((prev) => [...prev, ...page]);
      setSkip((s) => s + page.length);
      if (memes.length <= pageSize) setDone(true);
    } catch {
      setError(L.loadError);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [skip, pageSize, category, tag, q, excludeId, exclude, L.loadError]);

  // Watches the marker below the list. Re-created after each batch, so if the new cards still
  // leave the marker on screen (a tall monitor), the next batch loads straight away.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !auto || done || loading || error) return;
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && load(), { rootMargin: "400px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [load, auto, done, loading, error]);

  return (
    <>
      {items.map((m) => (
        <VaultCard key={m.id} meme={m} />
      ))}
      {/* Rendered inside the card grid, so the controls span the full row. */}
      {error && <p className="col-span-full rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>}
      {!done && (
        <div ref={sentinel} className="col-span-full flex min-h-12 items-center justify-center pt-2">
          {error || (!auto && !loading) ? (
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-hairline bg-white px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-ink shadow-card transition hover:bg-subtle"
            >
              {L.loadMore}
            </button>
          ) : (
            loading && (
              <span role="status" className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-ink" aria-hidden />
                {L.loading}
              </span>
            )
          )}
        </div>
      )}
    </>
  );
}
