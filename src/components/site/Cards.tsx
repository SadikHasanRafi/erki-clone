"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MemeImage } from "@/components/MemeImage";
import { formatCompact, readMinutes, timeAgo } from "@/lib/format";
import type { Meme } from "@/lib/types";
import { Icon, type IconName } from "./Icon";
import { useSettings } from "./SettingsProvider";

const href = (m: Meme) => `/meme/${m.slug}`;

// Labels, byline fallback and the "show view counts" switch from the dashboard.
function useCardSettings() {
  const { labels, siteName, display } = useSettings();
  return { L: labels, author: (m: Meme) => m.author || siteName, showViews: display.showPostViews };
}

// Section heading used across the home page: amber icon, tracked uppercase title, quiet note on the right.
export function SectionHead({ icon, title, note, id }: { icon?: IconName; title: string; note?: ReactNode; id?: string }) {
  return (
    <div id={id} className="flex scroll-mt-40 items-center justify-between gap-3 border-b border-hairline pb-2">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-ink">
        {icon && <Icon name={icon} className="h-4 w-4 text-amber" />}
        {title}
      </h2>
      {note && <span className="shrink-0 font-display text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{note}</span>}
    </div>
  );
}

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[11px] font-semibold ${className}`}>{children}</span>;
}

// Lead story: large image with kicker pills, then byline, headline and excerpt.
export function HeroCard({ meme }: { meme: Meme }) {
  const { L, author, showViews } = useCardSettings();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-white shadow-card transition hover:shadow-lift">
      <Link href={href(meme)} className="relative block aspect-[4/3] overflow-hidden bg-neutral-100 md:aspect-video">
        <MemeImage src={meme.imageUrl} alt={meme.title} sizes="(min-width: 1024px) 800px, 100vw" priority />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 md:left-4 md:top-4">
          <Pill className="bg-ink/90 uppercase tracking-wider text-amber-300 backdrop-blur-md">{meme.category}</Pill>
          {meme.featured && <Pill className="border border-neutral-200/80 bg-white/90 text-neutral-800 backdrop-blur-md">Featured</Pill>}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-neutral-900/80 px-3 py-1 font-display text-[11px] font-medium uppercase text-white backdrop-blur-md md:bottom-4 md:right-4">
          {readMinutes(meme.description, meme.body)} {L.minRead}
        </span>
      </Link>
      <div className="flex flex-1 flex-col justify-between gap-5 p-5 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-800">{author(meme)}</span>
            <span aria-hidden>•</span>
            <span>{timeAgo(meme.createdAt)}</span>
          </div>
          <Link href={href(meme)}>
            <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-neutral-900 transition-colors group-hover:text-amber-deep md:text-3xl lg:text-[34px]">
              {meme.title}
            </h1>
          </Link>
          {meme.description && <p className="line-clamp-3 text-[15px] leading-relaxed text-neutral-600 md:line-clamp-2 md:text-base">{meme.description}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
          <div className="flex items-center gap-2">
            {showViews && (
              <Pill className="bg-subtle px-3! py-1.5! text-xs text-neutral-700">
                <Icon name="eye" className="h-3.5 w-3.5" /> {formatCompact(meme.views)}
              </Pill>
            )}
            {meme.tags[0] && (
              <Link href={`/?tag=${encodeURIComponent(meme.tags[0])}`} className="rounded-full bg-subtle px-3 py-1.5 font-display text-xs font-semibold text-neutral-700 hover:bg-neutral-200/70">
                #{meme.tags[0]}
              </Link>
            )}
          </div>
          <Link href={href(meme)} className="flex items-center gap-1 font-display text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-ink">
            Read <Icon name="forward" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// Side story beside the hero: a compact row on phones, a full card from desktop up.
export function SpicyCard({ meme }: { meme: Meme }) {
  const { L, author, showViews } = useCardSettings();
  return (
    <Link
      href={href(meme)}
      className="group flex gap-3 rounded-xl border border-hairline bg-white p-3 shadow-card transition hover:shadow-lift lg:flex-col lg:gap-3 lg:p-4"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-neutral-200/60 bg-neutral-100 lg:hidden">
        <MemeImage src={meme.imageUrl} alt="" sizes="96px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-display text-[10px] font-semibold uppercase tracking-wider text-amber-deep lg:rounded-full lg:bg-amber-soft lg:px-2.5 lg:py-0.5 lg:text-[11px] lg:normal-case lg:tracking-normal">
            {meme.category}
            <span className="font-normal text-neutral-400 lg:hidden"> · {timeAgo(meme.createdAt)}</span>
          </span>
          {showViews && (
            <span className="hidden shrink-0 items-center gap-1 text-neutral-400 lg:flex">
              <Icon name="eye" className="h-3.5 w-3.5" /> {formatCompact(meme.views)} {L.views}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <h3 className="line-clamp-2 flex-1 font-display text-[15px] font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-amber-deep lg:line-clamp-3 lg:text-sm">
            {meme.title}
          </h3>
          <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200/60 bg-neutral-100 lg:block">
            <MemeImage src={meme.imageUrl} alt="" sizes="64px" />
          </div>
        </div>
        {showViews && (
          <span className="flex items-center gap-1 text-xs text-neutral-400 lg:hidden">
            <Icon name="eye" className="h-3.5 w-3.5" /> {formatCompact(meme.views)}
          </span>
        )}
        {meme.description && <p className="hidden text-xs leading-relaxed text-neutral-500 lg:line-clamp-2">{meme.description}</p>}
        <div className="hidden items-center justify-between border-t border-subtle pt-2 text-[11px] font-medium text-neutral-400 lg:flex">
          <span className="truncate">By {author(meme)}</span>
          <span className="shrink-0">{timeAgo(meme.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

// Ranked tile for the Viral Hall of Shame.
export function HallCard({ meme, rank }: { meme: Meme; rank: number }) {
  const { showViews } = useCardSettings();
  const first = rank === 1;
  return (
    <Link
      href={href(meme)}
      className="flex w-[72vw] max-w-[280px] shrink-0 snap-start flex-col justify-between rounded-xl border border-hairline/70 bg-canvas p-4 transition-colors hover:bg-neutral-100/50 sm:w-auto sm:max-w-none"
    >
      <div>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className={`font-mono text-2xl font-bold sm:text-base ${first ? "text-amber-deep" : "text-neutral-400"}`}>#{String(rank).padStart(2, "0")}</span>
          {showViews && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${first ? "bg-amber-soft text-amber-deep" : "bg-neutral-200/70 text-neutral-700"}`}>
              {formatCompact(meme.views)} hits
            </span>
          )}
        </div>
        <h3 className="mb-3 line-clamp-3 font-display text-base font-semibold leading-snug text-neutral-900 sm:text-xs">{meme.title}</h3>
      </div>
      <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{meme.category}</span>
    </Link>
  );
}

// Grid card for the Satire Vault and filtered result lists.
export function VaultCard({ meme }: { meme: Meme }) {
  const { showViews } = useCardSettings();
  return (
    <Link href={href(meme)} className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-card transition hover:shadow-lift">
      <div className="relative h-48 overflow-hidden border-b border-hairline bg-neutral-100 md:h-44">
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          <MemeImage src={meme.imageUrl} alt={meme.title} sizes="(min-width: 768px) 280px, 100vw" />
        </div>
        <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 font-display text-[10px] font-semibold uppercase text-neutral-800 shadow-sm">
          {meme.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <h3 className="line-clamp-3 font-display text-sm font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-amber-deep md:text-xs">
          {meme.title}
        </h3>
        <div className="flex items-center justify-between border-t border-subtle pt-2 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1 font-medium">
            {showViews && (
              <>
                <Icon name="eye" className="h-3.5 w-3.5" /> {formatCompact(meme.views)}
              </>
            )}
          </span>
          <span>{timeAgo(meme.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

// Numbered row with a small thumbnail: the leaderboard and the article sidebar lists.
export function RankRow({ meme, rank }: { meme: Meme; rank?: number }) {
  const { author, showViews } = useCardSettings();
  return (
    <Link href={href(meme)} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas">
      {rank !== undefined && (
        <span className={`w-5 text-center font-mono text-sm font-bold ${rank === 1 ? "text-amber-deep" : "text-neutral-400"}`}>{rank}</span>
      )}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
        <MemeImage src={meme.imageUrl} alt="" sizes="48px" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-xs font-medium leading-snug text-neutral-900 group-hover:text-amber-deep">{meme.title}</h3>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-400">
          {showViews && (
            <>
              <Icon name="eye" className="h-3 w-3" /> {formatCompact(meme.views)} •
            </>
          )}{" "}
          {author(meme)}
        </span>
      </div>
    </Link>
  );
}

// Editor's pick panel: amber-washed card with the quote-style headline and the image beside it.
export function MemeOfDay({ meme }: { meme: Meme }) {
  const { L, author, showViews } = useCardSettings();
  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber/30 bg-gradient-to-br from-amber-soft/60 to-white p-5 shadow-card md:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-neutral-900">
          <Icon name="trophy" className="h-5 w-5 text-amber" />
          {L.memeOfDay}
        </h2>
        <Pill className="border border-neutral-200/80 bg-white px-3! py-1! font-medium text-neutral-800">👑 {L.curatorPicks}</Pill>
      </div>
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        <div className="flex flex-col gap-3 md:col-span-7">
          <Link href={`/?category=${encodeURIComponent(meme.category)}`} className="font-display text-[11px] font-semibold uppercase tracking-widest text-amber-deep hover:underline">
            Category: {meme.category}
          </Link>
          <Link href={href(meme)}>
            <h3 className="font-display text-xl font-bold leading-snug text-neutral-900 hover:text-amber-deep md:text-2xl">“{meme.title}”</h3>
          </Link>
          {meme.description && <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">{meme.description}</p>}
          <p className="text-xs text-neutral-500">
            By <span className="font-semibold text-neutral-900 underline decoration-amber">{author(meme)}</span> · {timeAgo(meme.createdAt)}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={href(meme)}
              className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-ink-2"
            >
              <Icon name="forward" className="h-3.5 w-3.5 text-amber" /> Read it
            </Link>
            {showViews && (
              <span className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-600">
                <Icon name="eye" className="h-3.5 w-3.5 text-amber" /> {formatCompact(meme.views)} {L.views}
              </span>
            )}
          </div>
        </div>
        <Link href={href(meme)} className="relative block aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card md:col-span-5">
          <MemeImage src={meme.imageUrl} alt={meme.title} sizes="(min-width: 768px) 320px, 100vw" />
        </Link>
      </div>
    </section>
  );
}
