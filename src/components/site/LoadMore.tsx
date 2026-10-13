"use client";

import { useState } from "react";
import { LABELS } from "@/lib/config";
import type { Meme } from "@/lib/types";
import { LatestCard } from "./Cards";

export function LoadMore({
  initialSkip,
  pageSize,
  category,
  tag,
  q,
  excludeId,
}: {
  initialSkip: number;
  pageSize: number;
  category?: string;
  tag?: string;
  q?: string;
  excludeId?: string;
}) {
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
      const res = await fetch(`/api/memes?${params}`);
      if (!res.ok) throw new Error(String(res.status));
      const { memes } = (await res.json()) as { memes: Meme[] };
      const page = memes.slice(0, pageSize);
      setItems((prev) => [...prev, ...page]);
      setSkip((s) => s + page.length);
      if (memes.length <= pageSize) setDone(true);
    } catch {
      setError("লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {items.map((m) => (
        <LatestCard key={m.id} meme={m} />
      ))}
      {error && <p className="rounded bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>}
      {!done && (
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="w-full border border-zinc-300 bg-sun py-2.5 text-lg text-zinc-900 transition hover:bg-sun-dark disabled:opacity-60"
        >
          {loading ? "লোড হচ্ছে…" : LABELS.loadMore}
        </button>
      )}
    </>
  );
}
