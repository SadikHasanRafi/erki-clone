import Link from "next/link";
import { LatestCard, PopularCard, SectionBar } from "@/components/site/Cards";
import { LoadMore } from "@/components/site/LoadMore";
import { MoreBox, RecentList, SubmitBanner } from "@/components/site/Sidebar";
import { CATEGORIES, LABELS, LAYOUT } from "@/lib/config";
import { listMemes } from "@/lib/store";

type Props = { searchParams: Promise<{ category?: string; q?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const { category = "", q = "" } = await searchParams;
  const activeCategory = CATEGORIES.includes(category) ? category : "";
  const isFiltered = Boolean(activeCategory || q);
  const filter = { category: activeCategory || undefined, q: q || undefined };

  // The newest featured meme is pinned to the top of the latest column on the unfiltered home page.
  const pinned = isFiltered ? null : ((await listMemes({ featured: true, limit: 1 }))[0] ?? null);
  const [latestPlus, popular, recent] = await Promise.all([
    listMemes({ ...filter, excludeId: pinned?.id, limit: LAYOUT.latestPageSize + 1 }),
    listMemes({ category: filter.category, sort: "views", limit: LAYOUT.popularCount }),
    listMemes({ limit: LAYOUT.sidebarRecent }),
  ]);
  const latest = latestPlus.slice(0, LAYOUT.latestPageSize);
  const hasMore = latestPlus.length > LAYOUT.latestPageSize;
  const nothing = latest.length === 0 && !pinned;

  return (
    <main className="px-4 pb-4">
      {isFiltered && (
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-sky-700">
          <Link href="/" className="hover:underline">{LABELS.home}</Link>
          <span aria-hidden>›</span>
          <span>{q ? `“${q}”` : activeCategory}</span>
        </nav>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-cols-[268px_minmax(0,1fr)_400px]">
        <section className="order-2 space-y-4 lg:order-none">
          <SectionBar title={LABELS.popular} />
          {popular.length === 0 ? (
            <p className="text-sm text-zinc-500">এখনো কিছু নেই।</p>
          ) : (
            popular.map((m) => <PopularCard key={m.id} meme={m} />)
          )}
        </section>

        <section className="order-1 space-y-4 lg:order-none">
          <SectionBar title={activeCategory || LABELS.latest} />
          {nothing ? (
            <p className="rounded border border-zinc-200 p-10 text-center text-zinc-500">
              {isFiltered ? "এই ফিল্টারে কোনো মিম মেলেনি।" : "এখনো কোনো মিম নেই। একটু পরে আবার দেখুন!"}
            </p>
          ) : (
            <>
              {pinned && <LatestCard meme={pinned} priority />}
              {latest.map((m, i) => (
                <LatestCard key={m.id} meme={m} priority={!pinned && i === 0} />
              ))}
              {hasMore && (
                <LoadMore
                  initialSkip={LAYOUT.latestPageSize}
                  pageSize={LAYOUT.latestPageSize}
                  category={filter.category}
                  q={filter.q}
                  excludeId={pinned?.id}
                />
              )}
            </>
          )}
        </section>

        <aside className="order-3 space-y-6 lg:order-none">
          <MoreBox />
          <SubmitBanner />
          <RecentList memes={recent} />
        </aside>
      </div>
    </main>
  );
}
