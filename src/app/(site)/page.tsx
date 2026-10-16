import Link from "next/link";
import { HallCard, HeroCard, MemeOfDay, SectionHead, SpicyCard, VaultCard } from "@/components/site/Cards";
import { Icon } from "@/components/site/Icon";
import { LoadMore } from "@/components/site/LoadMore";
import { Pagination } from "@/components/site/Pagination";
import { Leaderboard, TagCloud } from "@/components/site/Sidebar";
import { listCategories } from "@/lib/categories";
import { pickOfTheDay } from "@/lib/format";
import { fillSlots } from "@/lib/placements";
import { getSettings } from "@/lib/settings";
import type { HomeSectionId, SectionToggle, SiteSettings } from "@/lib/site-settings";
import { countMemes, getMemesByIds, listMemes, listTags } from "@/lib/store";
import type { Meme } from "@/lib/types";
import { Suspense, type ReactNode } from "react";
import { FeedSkeleton, TopBar } from "@/components/Loader";

type Props = { searchParams: Promise<{ category?: string; tag?: string; q?: string; page?: string }> };

const shell = "mx-auto w-full max-w-7xl px-5 md:px-10 lg:px-8";

// Reads only the search params, then streams the real content inside Suspense. The key changes with every
// filter, so moving between desks shows the skeleton right away instead of freezing on the old page.
export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const filtered = Boolean(sp.category || sp.tag || sp.q);
  return (
    <Suspense
      key={JSON.stringify([sp.category, sp.tag, sp.q, sp.page])}
      fallback={
        <>
          <TopBar />
          <FeedSkeleton filtered={filtered} />
        </>
      }
    >
      <HomeContent {...sp} />
    </Suspense>
  );
}

async function HomeContent({ category = "", tag = "", q = "", page: pageParam }: Awaited<Props["searchParams"]>) {
  const [settings, categories] = await Promise.all([getSettings(), listCategories()]);
  const activeCategory = categories.some((c) => c.name === category) ? category : "";

  if (activeCategory || tag || q) {
    return <FilteredFeed settings={settings} category={activeCategory} tag={tag} q={q} pageParam={pageParam} />;
  }

  const { labels: L, layout, placements: P, home, display } = settings;
  const on = (list: SectionToggle[], id: HomeSectionId) => list.some((s) => s.id === id && s.enabled);
  const pinnedIds = [P.hero, ...P.spicy, ...P.hall, P.memeOfDay, ...P.wire, ...P.latest].filter(Boolean);

  const [pinnedList, featured, latest, recent, allTime, tags, latestFeed, publishedTotal, desks] = await Promise.all([
    getMemesByIds([...new Set(pinnedIds)]),
    listMemes({ featured: true, limit: 1 }).then((r) => r[0] ?? null),
    listMemes({ limit: layout.spicyCount + 1 }),
    listMemes({ limit: 30 }),
    listMemes({ sort: "views", limit: 10 }),
    on(home.sidebar, "tags") ? listTags() : Promise.resolve([]),
    on(home.main, "latest") ? listMemes({ limit: layout.latestCount, excludeIds: P.latest }) : Promise.resolve([]),
    countMemes(),
    on(home.main, "vault")
      ? Promise.all(
          categories.map(async (c) => ({
            ...c,
            memes: await listMemes({ category: c.name, limit: layout.perCategoryBlock }),
            total: await countMemes({ category: c.name }),
          })),
        )
      : Promise.resolve([]),
  ]);

  const byId = new Map(pinnedList.map((m) => [m.id, m]));
  const pinned = (ids: string[]) => ids.map((id) => byId.get(id)).filter((m): m is Meme => Boolean(m));

  const hero = byId.get(P.hero) ?? featured ?? latest[0];
  if (!hero) {
    return (
      <main className={`${shell} py-16`}>
        <p className="rounded-2xl border border-hairline bg-white p-10 text-center text-neutral-500">{L.empty}</p>
      </main>
    );
  }

  const spicy = fillSlots(pinned(P.spicy), latest, layout.spicyCount, new Set([hero.id]));
  // Trending now: the most viewed among the most recent posts.
  const hall = fillSlots(pinned(P.hall), [...recent].sort((a, b) => b.views - a.views), layout.hallCount);
  // A different top meme each day, cycling through the ten most viewed, unless one is pinned.
  const memeOfDay = byId.get(P.memeOfDay) ?? pickOfTheDay(allTime);
  const wire = fillSlots(pinned(P.wire), recent, layout.tickerCount);

  // Latest news: pinned stories on top, then newest first. Load More continues the automatic part.
  const latestPinned = pinned(P.latest).slice(0, layout.latestCount);
  const latestItems = fillSlots(latestPinned, latestFeed, layout.latestCount);
  const autoShown = latestItems.length - latestPinned.length;
  const hasMoreLatest = publishedTotal - latestPinned.length > autoShown;

  const top: Record<string, ReactNode> = {
    hero: (
      <div key="hero" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HeroCard meme={hero} />
        </div>
        {spicy.length > 0 && (
          <section className="flex flex-col gap-3 lg:col-span-4 lg:gap-4">
            <SectionHead icon="fire" title={L.spicy} note={L.spicyNote} />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 lg:gap-4">
              {spicy.map((m) => (
                <SpicyCard key={m.id} meme={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    ),
    hall: hall.length > 0 && (
      <section key="hall" className="-mx-5 rounded-none border-y border-hairline bg-white p-5 shadow-card md:mx-0 md:rounded-2xl md:border md:p-6">
        <div className="mb-5 flex scroll-mt-40 items-center justify-between gap-3 border-b border-subtle pb-3" id="hall-of-shame">
          <h2 className="flex items-center gap-2.5 font-display text-sm font-bold uppercase tracking-wider text-ink">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
            </span>
            {L.hallOfShame}
          </h2>
          <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{L.hallNote}</span>
        </div>
        <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-5">
          {hall.map((m, i) => (
            <HallCard key={m.id} meme={m} rank={i + 1} />
          ))}
        </div>
      </section>
    ),
  };

  const main: Record<string, ReactNode> = {
    memeOfDay: memeOfDay && <MemeOfDay key="memeOfDay" meme={memeOfDay} />,
    latest: latestItems.length > 0 && (
      <section key="latest" className="flex flex-col gap-5">
        <SectionHead icon="bolt" title={L.latest} note={L.latestNote} id="latest" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {latestItems.map((m) => (
            <VaultCard key={m.id} meme={m} />
          ))}
          {hasMoreLatest && <LoadMore initialSkip={autoShown} pageSize={layout.latestPageSize} auto={false} exclude={latestPinned.map((m) => m.id)} />}
        </div>
      </section>
    ),
    vault: desks.some((d) => d.memes.length > 0) && (
      <section key="vault" className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wider text-ink">{L.vault}</h2>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-display text-[10px] font-semibold uppercase text-neutral-600">{L.vaultNote}</span>
        </div>
        {desks
          .filter((d) => d.memes.length > 0)
          .map((d) => (
            <section key={d.id} className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-ink">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
                  {d.name}
                </h3>
                <Link
                  href={`/?category=${encodeURIComponent(d.name)}`}
                  className="shrink-0 font-display text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-ink hover:underline"
                >
                  {L.viewAll} {d.total}
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {d.memes.map((m) => (
                  <VaultCard key={m.id} meme={m} />
                ))}
              </div>
            </section>
          ))}
      </section>
    ),
  };

  const side: Record<string, ReactNode> = {
    leaderboard: <Leaderboard key="leaderboard" memes={allTime.slice(0, layout.leaderboardCount)} />,
    tags: <TagCloud key="tags" tags={tags} />,
  };

  const render = (list: SectionToggle[], blocks: Record<string, ReactNode>) => list.filter((s) => s.enabled).map((s) => blocks[s.id]).filter(Boolean);
  const topBlocks = render(home.top, top);
  const mainBlocks = render(home.main, main);
  const sideBlocks = render(home.sidebar, side);

  return (
    <main className="flex w-full flex-col">
      {display.showWire && <WireStrip memes={wire} labels={L} />}

      <div className={`${shell} py-6 md:py-8`}>
        {/* Phone edition line from the mobile design. */}
        <div className="mb-4 flex items-baseline justify-between md:hidden">
          <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-muted">{L.edition}</span>
          <span className="font-display text-lg font-semibold text-ink">{L.trending}</span>
        </div>

        {topBlocks.length > 0 && <div className="mb-10 flex flex-col gap-8 md:mb-12">{topBlocks}</div>}

        {(mainBlocks.length > 0 || sideBlocks.length > 0) && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            <div className={`flex min-w-0 flex-col gap-10 ${sideBlocks.length > 0 ? "lg:col-span-8" : "lg:col-span-12"}`}>{mainBlocks}</div>
            {sideBlocks.length > 0 && <aside className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-40 lg:max-h-[calc(100vh-11rem)] lg:self-start lg:overflow-y-auto no-scrollbar">{sideBlocks}</aside>}
          </div>
        )}
      </div>
    </main>
  );
}

// Scrolling "wire dispatch" strip of the newest headlines. The list is doubled so the loop is seamless.
function WireStrip({ memes, labels: L }: { memes: Meme[]; labels: SiteSettings["labels"] }) {
  if (memes.length === 0) return null;
  const items = (hidden: boolean) =>
    memes.map((m) => (
      <span key={`${hidden}-${m.id}`} className="flex items-center gap-8" aria-hidden={hidden || undefined}>
        <Link href={`/meme/${m.slug}`} tabIndex={hidden ? -1 : undefined} className="hover:text-ink">
          {m.title}
        </Link>
        <span className="opacity-25" aria-hidden>✦</span>
      </span>
    ));

  return (
    <div className="border-b border-hairline bg-subtle px-5 py-2 md:px-4">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-2.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-widest text-white">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
          <span className="hidden sm:inline">{L.wire}</span>
          <span className="sm:hidden">{L.tickerBadge}</span>
        </span>
        <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-flex items-center gap-8 text-xs font-medium tracking-wide text-neutral-600 motion-safe:animate-marquee hover:[animation-play-state:paused]">
            {items(false)}
            {items(true)}
          </div>
        </div>
        <span className="ml-2 hidden items-center gap-1 font-display text-[11px] font-semibold uppercase tracking-wider text-neutral-400 lg:inline-flex">
          <Icon name="bolt" className="h-3.5 w-3.5 text-amber" />
          {L.wireNote}
        </span>
      </div>
    </div>
  );
}

// Desk, tag or search results: a paginated card grid with the leaderboard beside it.
async function FilteredFeed({
  settings,
  category,
  tag,
  q,
  pageParam,
}: {
  settings: SiteSettings;
  category: string;
  tag: string;
  q: string;
  pageParam?: string;
}) {
  const { labels: L, layout } = settings;
  const filter = { category: category || undefined, tag: tag || undefined, q: q || undefined };
  const size = layout.latestPageSize;
  const total = await countMemes(filter);
  const totalPages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(Math.max(Number.parseInt(pageParam ?? "1", 10) || 1, 1), totalPages);

  const [memes, top, tags] = await Promise.all([
    listMemes({ ...filter, limit: size, skip: (page - 1) * size }),
    listMemes({ category: filter.category, sort: "views", limit: layout.leaderboardCount }),
    listTags(),
  ]);
  const title = q ? `“${q}”` : tag ? `#${tag}` : category;

  return (
    <main className={`${shell} py-6 md:py-8`}>
      <nav className="mb-4 flex flex-wrap items-center gap-2 font-display text-xs uppercase tracking-wider text-muted">
        <Link href="/" className="hover:text-ink">{L.home}</Link>
        <span className="text-neutral-300">/</span>
        <span className="font-semibold text-ink">{title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <section className="flex min-w-0 flex-col gap-5 lg:col-span-8">
          <SectionHead title={title} note={`${total}`} />
          {memes.length === 0 ? (
            <p className="rounded-2xl border border-hairline bg-white p-10 text-center text-neutral-500">{L.emptyFiltered}</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {memes.map((m) => (
                <VaultCard key={m.id} meme={m} />
              ))}
              {page < totalPages && (
                // Keyed so that moving to another page or filter starts the button from scratch.
                <LoadMore key={`${page}|${category}|${tag}|${q}`} initialSkip={page * size} pageSize={size} {...filter} />
              )}
              {/* Scrolling loads more automatically; numbered links remain for browsers without JavaScript. */}
              <noscript>
                <Pagination page={page} totalPages={totalPages} params={{ category, tag, q }} />
              </noscript>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-40 lg:max-h-[calc(100vh-11rem)] lg:self-start lg:overflow-y-auto no-scrollbar">
          <Leaderboard memes={top} title={category ? `${L.mostRead}: ${category}` : L.leaderboard} />
          <TagCloud tags={tags} active={tag} />
        </aside>
      </div>
    </main>
  );
}
