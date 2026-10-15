"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Meme } from "@/lib/types";
import { RankRow } from "./Cards";
import { Icon, type IconName } from "./Icon";
import { useLabels } from "./SettingsProvider";

// White sidebar panel with a hairline-ruled header.
export function Panel({ icon, title, note, children }: { icon?: IconName; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-hairline bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-subtle pb-3">
        <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-ink">
          {icon && <Icon name={icon} className="h-4 w-4 text-amber" />}
          {title}
        </h2>
        {note}
      </div>
      {children}
    </section>
  );
}

export function Leaderboard({ memes, title }: { memes: Meme[]; title?: string }) {
  const L = useLabels();
  if (memes.length === 0) return null;
  return (
    <Panel
      icon="medal"
      title={title ?? L.leaderboard}
      note={<span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-600">{L.leaderboardNote}</span>}
    >
      <div className="flex flex-col gap-1">
        {memes.map((m, i) => (
          <RankRow key={m.id} meme={m} rank={i + 1} />
        ))}
      </div>
    </Panel>
  );
}

export function TagCloud({ tags, active }: { tags: { tag: string; count: number }[]; active?: string }) {
  const L = useLabels();
  if (tags.length === 0) return null;
  return (
    <Panel icon="hash" title={L.tags}>
      <ul className="flex flex-wrap gap-1.5">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/?tag=${encodeURIComponent(tag)}`}
              aria-current={active === tag ? "page" : undefined}
              className={`block rounded-full border px-3 py-1 text-xs transition ${
                active === tag
                  ? "border-amber bg-amber-soft font-semibold text-ink"
                  : "border-neutral-200/80 bg-canvas text-neutral-600 hover:border-neutral-400 hover:text-ink"
              }`}
            >
              #{tag} <span className="text-neutral-400">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
