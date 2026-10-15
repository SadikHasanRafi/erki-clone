"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import type { LinkItem, SiteSettings } from "@/lib/site-settings";

export const inputClass = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand";

export function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div>
        <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
        {description && <p className="text-sm text-zinc-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  type = "text",
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-zinc-700">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} placeholder={placeholder} className={inputClass} />
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-zinc-700">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} maxLength={maxLength} className={`${inputClass} resize-y`} />
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function NumberField({ label, value, onChange, min = 1, max = 50 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-zinc-700">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className={inputClass}
      />
    </label>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-brand" />
      <span>
        <span className="block text-sm font-semibold text-zinc-800">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
    </label>
  );
}

// Editable list of { label, href } rows: social links and extra footer links.
export function LinkListEditor({ label, hint, value, onChange }: { label: string; hint?: string; value: LinkItem[]; onChange: (v: LinkItem[]) => void }) {
  const set = (i: number, patch: Partial<LinkItem>) => onChange(value.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div className="space-y-2">
      <div>
        <span className="block text-sm font-semibold text-zinc-700">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </div>
      {value.map((l, i) => (
        <div key={i} className="flex flex-wrap gap-2 sm:flex-nowrap">
          <input value={l.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="Label" aria-label="Label" maxLength={60} className={`${inputClass} sm:w-40`} />
          <input value={l.href} onChange={(e) => set(i, { href: e.target.value })} placeholder="https://… or /page" aria-label="Link" className={inputClass} />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-lg px-3 text-sm text-red-600 hover:bg-red-50">
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { label: "", href: "" }])} className="rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:border-brand hover:text-brand">
        + Add link
      </button>
    </div>
  );
}

// URL box plus an upload button that stores the file in Vercel Blob and fills in the URL.
export function ImageField({ label, hint, value, onChange, fallback }: { label: string; hint?: string; value: string; onChange: (v: string) => void; fallback?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > 5 * 1024 * 1024) return setError("Image must be 5 MB or smaller.");
    setBusy(true);
    try {
      const res = await fetch(`/api/upload/image?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const preview = value || fallback;
  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-zinc-700">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview of any URL */}
          {preview ? <img src={preview} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-zinc-400">None</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or /file.png" aria-label={`${label} URL`} className={inputClass} />
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-60">
              {busy ? "Uploading…" : "Upload image"}
            </button>
            {fallback && value !== fallback && (
              <button type="button" onClick={() => onChange(fallback)} className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100">
                Reset to default
              </button>
            )}
          </div>
        </div>
      </div>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Saves part of the settings and keeps the dashboard's copy in sync with what the server stored.
export function useSettingsSaver() {
  const router = useRouter();
  const [state, setState] = useState<{ busy: boolean; message: string; error: boolean }>({ busy: false, message: "", error: false });

  async function save(patch: Partial<SiteSettings>): Promise<SiteSettings | null> {
    setState({ busy: true, message: "", error: false });
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      setState({ busy: false, message: "Saved. The live site is updated.", error: false });
      router.refresh();
      return data.settings as SiteSettings;
    } catch (err) {
      setState({ busy: false, message: err instanceof Error ? err.message : "Could not save.", error: true });
      return null;
    }
  }

  return { save, ...state };
}

// Sticky footer with the save button and the last save result.
export function SaveBar({ busy, message, error, onSave }: { busy: boolean; message: string; error: boolean; onSave: () => void }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
      {message && <p className={`text-sm ${error ? "text-red-600" : "text-green-700"}`} role="status">{message}</p>}
      <button type="button" onClick={onSave} disabled={busy} className="rounded-lg bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        {busy ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
