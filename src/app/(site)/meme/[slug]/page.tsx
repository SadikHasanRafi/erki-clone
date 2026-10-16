import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleImage } from "@/components/MemeImage";
import { RankRow } from "@/components/site/Cards";
import { Icon } from "@/components/site/Icon";
import { ShareActions } from "@/components/site/ShareActions";
import { Leaderboard, Panel } from "@/components/site/Sidebar";
import { ViewCounter } from "@/components/ViewCounter";
import { listCategories } from "@/lib/categories";
import { SITE_URL } from "@/lib/config";
import { decodeSlug, readMinutes } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { countMemes, getAdjacentMemes, getMemeBySlug, listMemes } from "@/lib/store";
import type { Meme } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function findPublished(slug: string): Promise<Meme | null> {
  const meme = await getMemeBySlug(slug);
  return meme?.status === "published" ? meme : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meme = await findPublished(decodeSlug((await params).slug));
  if (!meme) return { title: "Not found" };
  const description = meme.description.slice(0, 160) || meme.title;
  return {
    title: meme.title,
    description,
    openGraph: { title: meme.title, description, images: [meme.imageUrl] },
  };
}

const deskHref = (category: string) => `/?category=${encodeURIComponent(category)}`;

export default async function MemePage({ params }: Props) {
  const meme = await findPublished(decodeSlug((await params).slug));
  if (!meme) notFound();

  const { labels: L, layout, siteName } = await getSettings();
  const [related, deskTotal, mostRead, adjacent, categories] = await Promise.all([
    listMemes({ category: meme.category, excludeId: meme.id, limit: layout.relatedCount }),
    countMemes({ category: meme.category }),
    listMemes({ sort: "views", excludeId: meme.id, limit: layout.leaderboardCount }),
    getAdjacentMemes(meme),
    listCategories(),
  ]);
  const deskColor = categories.find((c) => c.name === meme.category)?.color;

  const url = `${SITE_URL}/meme/${meme.slug}`;
  const author = meme.author || siteName;
  const paragraphs = (meme.body ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const published = new Date(meme.createdAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" });
  const share = { url, title: meme.title, imageUrl: meme.imageUrl };
  // Drop cap on the first paragraph of the story, editorial style.
  const dropCap = "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-none first-letter:text-ink";

  return (
    <article className="mx-auto w-full max-w-7xl px-5 md:px-10 lg:px-8">
      {/* Breadcrumb and story chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline py-4 md:py-5">
        <nav className="flex min-w-0 flex-wrap items-center gap-2 font-display text-[11px] uppercase tracking-wider text-muted md:text-xs">
          <Link href="/" className="transition-colors hover:text-ink">{L.home}</Link>
          <span className="text-neutral-300">/</span>
          <Link href={deskHref(meme.category)} className="font-semibold text-ink transition-colors hover:text-amber-deep">{meme.category}</Link>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          {meme.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber-soft px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-amber-deep">
              <Icon name="fire" className="h-3 w-3" /> Featured
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-white px-2.5 py-1 font-display text-[11px] uppercase text-muted">
            <Icon name="clock" className="h-3 w-3" /> {readMinutes(meme.description, meme.body)} {L.minRead}
          </span>
        </div>
      </div>

      {/* Masthead */}
      <header className="max-w-4xl pb-8 pt-6 md:pt-10">
        <Link
          href={deskHref(meme.category)}
          className="mb-4 inline-block rounded px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wider text-white"
          style={{ backgroundColor: deskColor ?? "#121316" }}
        >
          {meme.category}
        </Link>
        <h1 className="mb-4 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink md:mb-5 md:text-5xl">{meme.title}</h1>
        {meme.description && paragraphs.length > 0 && (
          <p className="mb-6 font-serif text-lg leading-relaxed text-neutral-600 md:mb-8 md:text-2xl">{meme.description}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-white p-3 shadow-card md:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-soft font-display text-lg font-bold text-amber-deep ring-2 ring-canvas" aria-hidden>
              {author[0]}
            </span>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-ink">{author}</span>
                <span className="rounded border border-hairline bg-subtle px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider text-neutral-600">Author</span>
              </div>
              <span className="text-xs text-muted">
                {published}<ViewCounter slug={meme.slug} initial={meme.views} />
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <ShareActions {...share} variant="inline" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        {/* Desktop share rail */}
        <aside className="sticky top-40 hidden flex-col items-center lg:col-span-1 lg:flex">
          <ShareActions {...share} variant="rail" />
        </aside>

        <div className="flex min-w-0 flex-col gap-10 lg:col-span-7">
          <figure className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-card">
            <div className="bg-[#eceae2]">
              <ArticleImage src={meme.imageUrl} alt={meme.title} />
            </div>
            <figcaption className="border-t border-hairline p-4 text-xs leading-relaxed text-muted">
              <strong className="font-medium text-ink">{meme.category}:</strong> {meme.title}
            </figcaption>
          </figure>

          <div className="flex flex-col gap-6 text-base leading-relaxed text-neutral-800 md:text-lg">
            {paragraphs.length > 0
              ? paragraphs.map((p, i) => (
                  <p key={i} className={`whitespace-pre-line ${i === 0 ? dropCap : "text-neutral-600"}`}>{p}</p>
                ))
              : meme.description && <p className={`whitespace-pre-line ${dropCap}`}>{meme.description}</p>}
          </div>

          {meme.sourceUrl && (
            <p className="text-sm">
              <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{L.source}: </span>
              <a href={meme.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-amber-deep hover:underline">
                {meme.sourceUrl}
              </a>
            </p>
          )}

          {meme.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-6">
              <span className="mr-2 font-display text-[11px] font-semibold uppercase text-neutral-400">{L.filedUnder}:</span>
              {meme.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-hairline bg-canvas px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-subtle hover:text-ink"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {(adjacent.prev || adjacent.next) && (
            <nav className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="More stories">
              {adjacent.prev ? <AdjacentCard meme={adjacent.prev} label={L.prevPost} /> : <span className="hidden md:block" />}
              {adjacent.next && <AdjacentCard meme={adjacent.next} label={L.nextPost} forward />}
            </nav>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-40 lg:max-h-[calc(100vh-11rem)] lg:self-start lg:overflow-y-auto no-scrollbar">
          <section className="flex flex-col gap-3 rounded-2xl border border-hairline bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <span className="rounded bg-subtle px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-ink">{L.deskDispatch}</span>
              <Icon name="bolt" className="h-4 w-4 text-amber" />
            </div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase leading-tight text-ink">
              {deskColor && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: deskColor }} aria-hidden />}
              {meme.category}
            </h2>
            <Link href={deskHref(meme.category)} className="text-xs font-semibold text-amber-deep hover:underline">
              {L.viewAll} {deskTotal} →
            </Link>
          </section>

          {related.length > 0 && (
            <Panel
              title={L.moreFromDesk}
              note={
                <Link href={deskHref(meme.category)} className="text-xs font-semibold text-amber-deep hover:underline">
                  {L.viewAll}
                </Link>
              }
            >
              <div className="flex flex-col gap-1">
                {related.map((m) => (
                  <RankRow key={m.id} meme={m} />
                ))}
              </div>
            </Panel>
          )}

          <Leaderboard memes={mostRead} title={L.mostRead} />
        </aside>
      </div>

      <ShareActions {...share} variant="bar" />
    </article>
  );
}

function AdjacentCard({ meme, label, forward = false }: { meme: Meme; label: string; forward?: boolean }) {
  return (
    <Link
      href={`/meme/${meme.slug}`}
      className={`group flex flex-col justify-between gap-3 rounded-xl border border-hairline bg-white p-5 shadow-card transition-all hover:border-ink ${forward ? "md:text-right" : ""}`}
    >
      <span className={`flex items-center gap-1 font-display text-[11px] font-semibold uppercase tracking-wider text-neutral-400 transition-colors group-hover:text-amber-deep ${forward ? "md:justify-end" : ""}`}>
        {!forward && <Icon name="back" className="h-3.5 w-3.5" />}
        {label}
        {forward && <Icon name="forward" className="h-3.5 w-3.5" />}
      </span>
      <span className="line-clamp-3 font-display text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-amber-deep md:text-base">{meme.title}</span>
      <span className="text-[11px] uppercase tracking-wider text-muted">{meme.category}</span>
    </Link>
  );
}
