"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/dashboard/ConfirmModal";
import { Pager, usePaging } from "@/components/dashboard/Pager";
import type { ContactMessage } from "@/lib/messages";

type Filter = "all" | "unread";

export function MessagesInbox({ initial }: { initial: ContactMessage[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
  const [error, setError] = useState("");

  const unread = items.filter((m) => !m.read).length;
  const filtered = items.filter((m) => filter === "all" || !m.read);
  const paging = usePaging(filtered.length);
  const rows = paging.slice(filtered);

  // Updates the list at once, then tells the server; puts it back if the server says no.
  async function markRead(m: ContactMessage, read: boolean) {
    setError("");
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, read } : x)));
    try {
      const res = await fetch(`/api/admin/messages/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: m.read } : x)));
      setError("Could not update the message. Check your connection and try again.");
    }
  }

  async function markAllRead() {
    setError("");
    const before = items;
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    try {
      const res = await fetch("/api/admin/messages", { method: "PATCH" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setItems(before);
      setError("Could not mark all messages as read.");
    }
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                paging.setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 font-medium capitalize ${filter === f ? "bg-white text-brand shadow-sm" : "text-zinc-600"}`}
            >
              {f}
              {f === "unread" && unread > 0 ? ` (${unread})` : ""}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unread === 0}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand ring-1 ring-brand/30 hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark all as read
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-white p-10 text-center text-zinc-500 shadow-sm ring-1 ring-black/5">
          {filter === "unread" && items.length > 0 ? "No unread messages. You're all caught up." : "No messages yet. They arrive here from the contact form."}
        </p>
      ) : (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
          <ul className="divide-y divide-zinc-200">
            {rows.map((m) => (
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
                      <button type="button" onClick={() => markRead(m, !m.read)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-300 hover:bg-zinc-100">
                        {m.read ? "Mark as unread" : "Mark as read"}
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
          <Pager total={filtered.length} page={paging.page} pageSize={paging.pageSize} pageCount={paging.pageCount} onPage={paging.setPage} onPageSize={paging.setPageSize} noun="messages" />
        </div>
      )}
    </div>
  );
}
