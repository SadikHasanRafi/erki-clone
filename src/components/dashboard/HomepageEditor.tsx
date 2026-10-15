"use client";

import Link from "next/link";
import { useState } from "react";
import { SECTION_NAMES, type SectionToggle, type SiteSettings } from "@/lib/site-settings";
import { Card, SaveBar, inputClass, useSettingsSaver } from "./fields";

export type PostOption = { id: string; title: string; category: string };

type Placements = SiteSettings["placements"];
type Home = SiteSettings["home"];

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const smallBtn = "rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-30";

function SectionList({ title, value, onChange }: { title: string; value: SectionToggle[]; onChange: (v: SectionToggle[]) => void }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
      <ol className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {value.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 px-3 py-2">
            <input
              type="checkbox"
              checked={s.enabled}
              onChange={(e) => onChange(value.map((x) => (x.id === s.id ? { ...x, enabled: e.target.checked } : x)))}
              aria-label={`Show ${SECTION_NAMES[s.id]}`}
              className="h-4 w-4 accent-brand"
            />
            <span className={`flex-1 text-sm ${s.enabled ? "font-medium text-zinc-800" : "text-zinc-400 line-through"}`}>{SECTION_NAMES[s.id]}</span>
            <button type="button" className={smallBtn} disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))} aria-label="Move up">▲</button>
            <button type="button" className={smallBtn} disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))} aria-label="Move down">▼</button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function optionLabel(p: PostOption) {
  return `${p.title.slice(0, 90)} — ${p.category}`;
}

function SinglePick({ label, hint, value, posts, onChange }: { label: string; hint: string; value: string; posts: PostOption[]; onChange: (v: string) => void }) {
  const missing = value && !posts.some((p) => p.id === value);
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-zinc-800">{label}</span>
      <span className="mb-1.5 block text-xs text-zinc-500">{hint}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Automatic</option>
        {missing && <option value={value}>(Unpublished or deleted post)</option>}
        {posts.map((p) => (
          <option key={p.id} value={p.id}>{optionLabel(p)}</option>
        ))}
      </select>
    </label>
  );
}

function MultiPick({ label, hint, value, max, posts, onChange }: { label: string; hint: string; value: string[]; max: number; posts: PostOption[]; onChange: (v: string[]) => void }) {
  const byId = new Map(posts.map((p) => [p.id, p]));
  const available = posts.filter((p) => !value.includes(p.id));
  return (
    <div className="space-y-1.5">
      <div>
        <span className="block text-sm font-semibold text-zinc-800">{label}</span>
        <span className="block text-xs text-zinc-500">
          {hint} {value.length > max && <strong className="text-amber-700">Only the first {max} fit in this block (change it in Settings → Display & counts).</strong>}
        </span>
      </div>
      {value.length > 0 && (
        <ol className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          {value.map((id, i) => {
            const p = byId.get(id);
            return (
              <li key={id} className={`flex items-center gap-2 px-3 py-2 ${i >= max ? "opacity-50" : ""}`}>
                <span className="w-5 text-xs font-bold text-zinc-400">{i + 1}</span>
                <span className="flex-1 truncate text-sm text-zinc-800">{p ? optionLabel(p) : "(Unpublished or deleted post)"}</span>
                <button type="button" className={smallBtn} disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))} aria-label="Move up">▲</button>
                <button type="button" className={smallBtn} disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))} aria-label="Move down">▼</button>
                <button type="button" className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => onChange(value.filter((x) => x !== id))}>
                  Remove
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <select
        value=""
        onChange={(e) => e.target.value && onChange([...value, e.target.value])}
        aria-label={`Pin a post to ${label}`}
        className={inputClass}
        disabled={available.length === 0}
      >
        <option value="">+ Pin a post…</option>
        {available.map((p) => (
          <option key={p.id} value={p.id}>{optionLabel(p)}</option>
        ))}
      </select>
    </div>
  );
}

export function HomepageEditor({ initial, posts }: { initial: Pick<SiteSettings, "home" | "placements" | "layout">; posts: PostOption[] }) {
  const [home, setHome] = useState<Home>(initial.home);
  const [p, setP] = useState<Placements>(initial.placements);
  const { save, busy, message, error } = useSettingsSaver();
  const L = initial.layout;

  const setPlace = <K extends keyof Placements>(key: K, value: Placements[K]) => setP((prev) => ({ ...prev, [key]: value }));

  async function onSave() {
    const saved = await save({ home, placements: p });
    if (saved) {
      setHome(saved.home);
      setP(saved.placements);
    }
  }

  return (
    <div className="space-y-5">
      <Card title="Sections" description="Turn home page blocks on or off and change their order.">
        <div className="flex justify-end">
          <Link href="/" target="_blank" className="text-sm text-brand hover:underline">Open home page ↗</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <SectionList title="Top (full width)" value={home.top} onChange={(top) => setHome({ ...home, top })} />
          <SectionList title="Main column" value={home.main} onChange={(main) => setHome({ ...home, main })} />
          <SectionList title="Sidebar" value={home.sidebar} onChange={(sidebar) => setHome({ ...home, sidebar })} />
        </div>
      </Card>

      <Card
        title="Post placement"
        description="Choose exactly which post appears where. Pinned posts come first, in the order listed; any empty spots fill automatically with the newest or most viewed posts."
      >
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500">Publish some posts first.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <SinglePick label="Hero (main story)" hint="Automatic: the featured post, else the newest." value={p.hero} posts={posts} onChange={(v) => setPlace("hero", v)} />
            <SinglePick label="Meme of the Day" hint="Automatic: rotates daily through the most viewed." value={p.memeOfDay} posts={posts} onChange={(v) => setPlace("memeOfDay", v)} />
            <MultiPick label="Spicy Dispatches" hint="Beside the hero. Automatic: newest." value={p.spicy} max={L.spicyCount} posts={posts} onChange={(v) => setPlace("spicy", v)} />
            <MultiPick label="Viral Hall of Shame" hint="Automatic: most viewed recent posts." value={p.hall} max={L.hallCount} posts={posts} onChange={(v) => setPlace("hall", v)} />
            <MultiPick label="Headlines (ticker & wire strip)" hint="Automatic: newest." value={p.wire} max={L.tickerCount} posts={posts} onChange={(v) => setPlace("wire", v)} />
            <MultiPick label="Latest News (top of the list)" hint="Pinned above the newest posts." value={p.latest} max={L.latestCount} posts={posts} onChange={(v) => setPlace("latest", v)} />
          </div>
        )}
      </Card>

      <SaveBar busy={busy} message={message} error={error} onSave={onSave} />
    </div>
  );
}
