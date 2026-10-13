import Link from "next/link";
import { MemeCard, MemeImage } from "@/components/MemeCard";
import { CATEGORIES } from "@/lib/config";
import { listMemes } from "@/lib/store";

type Props = { searchParams: Promise<{ category?: string; q?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const { category = "", q = "" } = await searchParams;
  const isFiltered = Boolean(category || q);

  const memes = await listMemes({ category: category || undefined, q: q || undefined });
  // The hero is the newest featured meme, or the newest meme if nothing is featured.
  const hero = isFiltered ? null : (memes.find((m) => m.featured) ?? memes[0] ?? null);
  const grid = hero ? memes.filter((m) => m.id !== hero.id) : memes;
  const trending = [...(await listMemes())].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <form action="/" className="mb-4 flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search memes… মিম খুঁজুন"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-brand"
        />
        <button className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark">
          Search
        </button>
      </form>

      <nav className="mb-6 flex flex-wrap gap-2">
        <CategoryLink href="/" active={!category} label="All" />
        {CATEGORIES.map((c) => (
          <CategoryLink
            key={c}
            href={`/?category=${encodeURIComponent(c)}`}
            active={category === c}
            label={c}
          />
        ))}
      </nav>

      {hero && (
        <Link
          href={`/meme/${hero.slug}`}
          className="group mb-8 grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 md:grid-cols-2"
        >
          <div className="relative aspect-[4/5] bg-zinc-100 md:aspect-auto md:min-h-[420px]">
            <MemeImage
              src={hero.imageUrl}
              alt={hero.title}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center gap-3 p-6">
            <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-white">
              Top story
            </span>
            <h1 className="text-2xl font-bold leading-tight text-zinc-900 group-hover:text-brand md:text-3xl">
              {hero.title}
            </h1>
            <p className="line-clamp-4 whitespace-pre-line text-zinc-600">{hero.description}</p>
            <span className="text-sm font-semibold text-brand">{hero.category}</span>
          </div>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section>
          {grid.length === 0 ? (
            <p className="rounded-xl bg-white p-10 text-center text-zinc-500 ring-1 ring-black/5">
              {isFiltered ? "No memes match this filter." : "No memes yet. Check back soon!"}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {grid.map((meme) => (
                <MemeCard key={meme.id} meme={meme} />
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-xl bg-white p-4 ring-1 ring-black/5">
          <h2 className="mb-3 border-b-2 border-accent pb-2 text-lg font-bold text-brand">
            Trending now
          </h2>
          <ol className="space-y-3">
            {trending.map((meme, i) => (
              <li key={meme.id}>
                <Link href={`/meme/${meme.slug}`} className="group flex gap-3">
                  <span className="text-2xl font-black text-accent">{(i + 1).toLocaleString("bn-BD")}</span>
                  <span>
                    <span className="line-clamp-2 font-semibold leading-snug text-zinc-900 group-hover:text-brand">
                      {meme.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {meme.views.toLocaleString("bn-BD")} views
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            {trending.length === 0 && <li className="text-sm text-zinc-500">Nothing yet.</li>}
          </ol>
        </aside>
      </div>
    </main>
  );
}

function CategoryLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-brand text-white"
          : "bg-white text-zinc-700 ring-1 ring-black/10 hover:text-brand"
      }`}
    >
      {label}
    </Link>
  );
}
