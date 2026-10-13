"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MemeImage } from "@/components/MemeCard";
import type { Meme } from "@/lib/types";

type Filter = "all" | "published" | "draft";

// Builds the same multipart body the edit form sends, so quick toggles reuse the PATCH route.
function toFormData(meme: Meme, overrides: Partial<Pick<Meme, "status" | "featured">>): FormData {
  const form = new FormData();
  form.set("title", meme.title);
  form.set("description", meme.description);
  form.set("category", meme.category);
  form.set("tags", meme.tags.join(", "));
  form.set("status", overrides.status ?? meme.status);
  if (overrides.featured ?? meme.featured) form.set("featured", "on");
  return form;
}

export function MemeTable({ memes }: { memes: Meme[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const rows = memes.filter((m) => filter === "all" || m.status === filter);

  async function update(meme: Meme, overrides: Partial<Pick<Meme, "status" | "featured">>) {
    setBusyId(meme.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/memes/${meme.id}`, {
        method: "PATCH",
        body: toFormData(meme, overrides),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error ?? "Update failed.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(meme: Meme) {
    if (!confirm(`Delete "${meme.title}"? This cannot be undone.`)) return;
    setBusyId(meme.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/memes/${meme.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Delete failed.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4">
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 font-medium capitalize ${
                filter === f ? "bg-white text-brand shadow-sm" : "text-zinc-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
      </div>

      {rows.length === 0 ? (
        <p className="p-10 text-center text-zinc-500">
          Nothing here yet.{" "}
          <Link href="/dashboard/new" className="font-semibold text-brand underline">
            Upload your first meme
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Meme</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((meme) => {
                const busy = busyId === meme.id;
                return (
                  <tr key={meme.id} className={busy ? "opacity-50" : ""}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-zinc-100">
                          <MemeImage src={meme.imageUrl} alt="" sizes="56px" />
                        </div>
                        <div className="min-w-[180px]">
                          <p className="line-clamp-2 font-semibold text-zinc-900">{meme.title}</p>
                          <p className="text-xs text-zinc-400">/{meme.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{meme.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          meme.status === "published"
                            ? "bg-brand/10 text-brand"
                            : "bg-zinc-200 text-zinc-600"
                        }`}
                      >
                        {meme.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={busy}
                        onClick={() => update(meme, { featured: !meme.featured })}
                        className={`text-lg ${meme.featured ? "text-accent" : "text-zinc-300 hover:text-zinc-500"}`}
                        aria-label={meme.featured ? "Remove from hero" : "Set as hero"}
                        title={meme.featured ? "Featured (hero) — click to remove" : "Click to feature as hero"}
                      >
                        ★
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{meme.views.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <Link href={`/dashboard/${meme.id}`} className="rounded px-2.5 py-1.5 font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50">
                          Edit
                        </Link>
                        <button
                          disabled={busy}
                          onClick={() =>
                            update(meme, { status: meme.status === "published" ? "draft" : "published" })
                          }
                          className="rounded px-2.5 py-1.5 font-medium text-brand ring-1 ring-brand/30 hover:bg-brand/5"
                        >
                          {meme.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => remove(meme)}
                          className="rounded px-2.5 py-1.5 font-medium text-accent ring-1 ring-accent/30 hover:bg-accent/5"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
