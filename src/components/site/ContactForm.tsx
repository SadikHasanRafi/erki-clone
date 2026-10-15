"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { useSettings } from "./SettingsProvider";

type Status = "idle" | "sending" | "sent" | "error";

// Sends to /api/contact; messages land in the dashboard inbox. `compact` is the footer version.
export function ContactForm({ compact = false }: { compact?: boolean }) {
  const { labels: L, contact } = useSettings();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? L.formError);
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : L.formError);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex flex-col gap-2">
          <p>{contact.successMessage}</p>
          <button type="button" onClick={() => setStatus("idle")} className="self-start text-xs font-semibold underline">
            {L.formSend}
          </button>
        </div>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-hairline bg-white px-3 text-sm text-ink outline-none transition placeholder:text-neutral-400 focus:border-amber focus:ring-2 focus:ring-amber-soft";
  const pad = compact ? "py-2" : "py-2.5";

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <div className={`grid gap-2.5 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <input name="name" required maxLength={100} placeholder={L.formName} aria-label={L.formName} autoComplete="name" className={`${input} ${pad}`} />
        <input name="email" type="email" required maxLength={200} placeholder={L.formEmail} aria-label={L.formEmail} autoComplete="email" className={`${input} ${pad}`} />
      </div>
      {!compact && <input name="subject" maxLength={200} placeholder={L.formSubject} aria-label={L.formSubject} className={`${input} ${pad}`} />}
      <textarea
        name="message"
        required
        maxLength={5000}
        rows={compact ? 3 : 6}
        placeholder={L.formMessage}
        aria-label={L.formMessage}
        className={`${input} resize-y py-2.5`}
      />
      {/* Honeypot: hidden from people, filled in by spam bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {status === "error" && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="flex items-center justify-center gap-2 self-start rounded-full bg-ink px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-ink-2 disabled:opacity-60"
      >
        <Icon name="mail" className="h-3.5 w-3.5 text-amber" />
        {status === "sending" ? L.formSending : L.formSend}
      </button>
    </form>
  );
}
