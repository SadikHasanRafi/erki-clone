"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/dashboard/ConfirmModal";
import type { Category } from "@/lib/types";

export function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? "Could not add the category.");
      setItems((prev) => [...prev, data.category]);
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Category) {
    setError("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? "Could not delete the category.");
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      router.refresh();
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  async function recolor(c: Category, next: string) {
    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, color: next } : x)));
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: next }),
    });
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-5">
      <ConfirmModal
        open={toDelete !== null}
        title="Delete this category?"
        message={toDelete ? `“${toDelete.name}” will be removed. Categories that still have memes cannot be deleted.` : ""}
        busy={deleting}
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="min-w-40 flex-1">
          <label htmlFor="cat-name" className="mb-1 block text-sm font-semibold text-zinc-700">New category</label>
          <input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Colour" className="h-10 w-12 cursor-pointer rounded border border-zinc-300" />
        <button disabled={busy} className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          Add
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <ul className="divide-y divide-zinc-200 rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            <input type="color" value={c.color} onChange={(e) => recolor(c, e.target.value)} aria-label={`${c.name} colour`} className="h-8 w-10 cursor-pointer rounded border border-zinc-300" />
            <span className="flex-1 font-medium text-zinc-800">{c.name}</span>
            <button type="button" onClick={() => setToDelete(c)} className="text-sm text-red-600 hover:underline">Delete</button>
          </li>
        ))}
        {items.length === 0 && <li className="px-4 py-6 text-center text-zinc-500">No categories yet.</li>}
      </ul>
    </div>
  );
}
