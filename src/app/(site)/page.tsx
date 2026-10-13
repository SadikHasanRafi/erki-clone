import Link from "next/link";
import { LatestCard, PopularCard, SectionBar } from "@/components/site/Cards";
import { LoadMore } from "@/components/site/LoadMore";
import { Pagination } from "@/components/site/Pagination";
import { MoreBox, RecentList, SubmitBanner, TagBox } from "@/components/site/Sidebar";
import { listCategoryNames } from "@/lib/categories";
import { LABELS, LAYOUT } from "@/lib/config";
import { countMemes, listMemes, listTags } from "@/lib/store";

type Props = { searchParams: Promise<{ category?: string; tag?: string; q?: string; page?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const { category = "", tag = "", q = "", page: pageParam } = await searchParams;
  const categories = await listCategoryNames();
  const activeCategory = categories.includes(category) ? category : "";
  const isFiltered = Boolean(activeCategory || tag || q);
  const filter = { category: activeCategory || undefined, tag: tag || undefined, q: q || undefined };
  const size = LAYOUT.latestPageSize;

  // The newest featured meme is pinned to the top of the first page of the unfiltered home page.
  const pinned = isFiltered ? null : ((await listMemes({ featured: true, limit: 1 }))[0] ?? null);
  const total = await countMemes({ ...filter, excludeId: pinned?.id });
  const totalPages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(Math.max(Number.parseInt(pageParam ?? "1", 10) || 1, 1), totalPages);

  const [latest, popular, recent, tags] = await Promise.all([
    listMemes({ ...filter, excludeId: pinned?.id, limit: size, skip: (page - 1) * size }),
    listMemes({ category: filter.category, sort: "views", limit: LAYOUT.popularCount }),
    listMemes({ limit: LAYOUT.sidebarRecent }),
    listTags(),
  ]);
  const showPinned = pinned && page === 1;
  const hasMore = page < totalPages;
  const nothing = latest.length === 0 && !showPinned;

  return (
    <main className="px-4 pb-4">
      {isFiltered && (
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-sky-700">
          <Link href="/" className="hover:underline">{LABELS.home}</Link>
          <span aria-hidden>›</span>
          <span>{q ? `“${q}”` : tag ? `#${tag}` : activeCategory}</span>
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
          <SectionBar title={activeCategory || (tag ? `#${tag}` : LABELS.latest)} />
          {nothing ? (
            <p className="rounded border border-zinc-200 p-10 text-center text-zinc-500">
              {isFiltered ? "এই ফিল্টারে কোনো মিম মেলেনি।" : "এখনো কোনো মিম নেই। একটু পরে আবার দেখুন!"}
            </p>
          ) : (
            <>
              {showPinned && <LatestCard meme={pinned} priority />}
              {latest.map((m, i) => (
                <LatestCard key={m.id} meme={m} priority={!showPinned && i === 0} />
              ))}
              {hasMore && (
                // Keyed so that moving to another page or filter starts the button from scratch.
                <LoadMore
                  key={`${page}|${activeCategory}|${tag}|${q}`}
                  initialSkip={page * size}
                  pageSize={size}
                  category={filter.category}
                  tag={filter.tag}
                  q={filter.q}
                  excludeId={pinned?.id}
                />
              )}
              <Pagination page={page} totalPages={totalPages} params={{ category: activeCategory, tag, q }} />
            </>
          )}
        </section>

        <aside className="order-3 space-y-6 lg:order-none">
          <MoreBox />
          <TagBox tags={tags} active={tag} />
          <SubmitBanner />
          <RecentList memes={recent} />
        </aside>
      </div>
    </main>
  );
}
