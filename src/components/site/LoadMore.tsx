"use client";

import { useState } from "react";
import type { Meme } from "@/lib/types";
import { VaultCard } from "./Cards";
import { useLabels } from "./SettingsProvider";

export function LoadMore({
  initialSkip,
  pageSize,
  category,
  tag,
  q,
  excludeId,
  exclude,
}: {
  initialSkip: number;
  pageSize: number;
  category?: string;
  tag?: string;
  q?: string;
  excludeId?: string;
  exclude?: string[];
}) {
  const L = useLabels();
  const [items, setItems] = useState<Meme[]>([]);
  const [skip, setSkip] = useState(initialSkip);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
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
      setLoading(false);
    }
  }

  return (
    <>
      {items.map((m) => (
        <VaultCard key={m.id} meme={m} />
      ))}
      {/* Rendered inside the card grid, so the controls span the full row. */}
      {error && <p className="col-span-full rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>}
      {!done && (
        <div className="col-span-full flex justify-center pt-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-full border border-hairline bg-white px-6 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-ink shadow-card transition hover:bg-subtle disabled:opacity-60"
          >
            {loading ? L.loading : L.loadMore}
          </button>
        </div>
      )}
    </>
  );
}
