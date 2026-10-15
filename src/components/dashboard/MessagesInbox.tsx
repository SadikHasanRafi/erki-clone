"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/dashboard/ConfirmModal";
import type { ContactMessage } from "@/lib/messages";

export function MessagesInbox({ initial }: { initial: ContactMessage[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
  const [error, setError] = useState("");

  async function markRead(m: ContactMessage, read: boolean) {
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, read } : x)));
    const res = await fetch(`/api/admin/messages/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    if (!res.ok) setError("Could not update the message.");
    router.refresh();
  }

  function toggle(m: ContactMessage) {
    setOpen((cur) => (cur === m.id ? null : m.id));
    if (!m.read) markRead(m, true);
  }

  async function remove(m: ContactMessage) {
    const res = await fetch(`/api/admin/messages/${m.id}`, { method: "DELETE" });
    setToDelete(null);
    if (!res.ok) return setError("Could not delete the message.");
    setItems((prev) => prev.filter((x) => x.id !== m.id));
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <ConfirmModal
        open={toDelete !== null}
        title="Delete this message?"
        message={toDelete ? `The message from ${toDelete.name} will be removed for good.` : ""}
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-10 text-center text-zinc-500 shadow-sm ring-1 ring-black/5">No messages yet. They arrive here from the contact form.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl bg-white shadow-sm ring-1 ring-black/5">
          {items.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => toggle(m)} aria-expanded={open === m.id} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-zinc-50">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-brand"}`} aria-label={m.read ? undefined : "Unread"} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className={`truncate ${m.read ? "text-zinc-700" : "font-bold text-zinc-900"}`}>{m.name}</span>
                    <span className="shrink-0 text-xs text-zinc-500">{new Date(m.createdAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </span>
                  <span className="block truncate text-sm text-zinc-500">
                    {m.subject ? <strong className="font-medium text-zinc-700">{m.subject} · </strong> : null}
                    {m.message}
                  </span>
                </span>
              </button>
              {open === m.id && (
                <div className="space-y-3 border-t border-zinc-100 bg-zinc-50 px-4 py-4 sm:pl-9">
                  <p className="text-sm text-zinc-600">
                    From <strong className="text-zinc-900">{m.name}</strong> &lt;
                    <a href={`mailto:${m.email}`} className="text-brand hover:underline">{m.email}</a>&gt;
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{m.message}</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`}
                      className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
                    >
                      Reply by email
                    </a>
                    <button type="button" onClick={() => markRead(m, false)} className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200">
                      Mark unread
                    </button>
                    <button type="button" onClick={() => setToDelete(m)} className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
