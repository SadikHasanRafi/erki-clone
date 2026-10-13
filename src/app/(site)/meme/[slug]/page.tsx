import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemeCard, MemeImage } from "@/components/MemeCard";
import { ViewCounter } from "@/components/ViewCounter";
import { SITE_URL } from "@/lib/config";
import { getMemeBySlug, listMemes } from "@/lib/store";
import type { Meme } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function findPublished(slug: string): Promise<Meme | null> {
  const meme = await getMemeBySlug(slug);
  return meme?.status === "published" ? meme : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meme = await findPublished((await params).slug);
  if (!meme) return { title: "Not found" };
  const description = meme.description.slice(0, 160) || meme.title;
  return {
    title: meme.title,
    description,
    openGraph: { title: meme.title, description, images: [meme.imageUrl] },
  };
}

export default async function MemePage({ params }: Props) {
  const meme = await findPublished((await params).slug);
  if (!meme) notFound();

  const related = (await listMemes({ category: meme.category, limit: 7 }))
    .filter((m) => m.id !== meme.id)
    .slice(0, 6);

  const url = `${SITE_URL}/meme/${meme.slug}`;
  const shareText = encodeURIComponent(`${meme.title} ${url}`);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6">
      <nav className="mb-4 text-sm text-zinc-500">
        <Link href="/" className="hover:text-brand">Home</Link>
        {" / "}
        <Link
          href={`/?category=${encodeURIComponent(meme.category)}`}
          className="hover:text-brand"
        >
          {meme.category}
        </Link>
      </nav>

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 sm:aspect-auto sm:min-h-[480px]">
        <MemeImage src={meme.imageUrl} alt={meme.title} priority sizes="(max-width: 768px) 100vw, 768px" />
      </div>

      <header className="mt-6 space-y-3">
        <h1 className="text-2xl font-bold leading-tight text-zinc-900 md:text-3xl">{meme.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span className="font-semibold uppercase tracking-wide text-accent">{meme.category}</span>
          <span>{new Date(meme.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          <ViewCounter slug={meme.slug} initial={meme.views} />
        </div>
      </header>

      {meme.description && (
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-zinc-700">{meme.description}</p>
      )}

      {meme.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {meme.tags.map((tag) => (
            <li key={tag}>
              <Link
                href={`/?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand hover:bg-brand/20"
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-2.5">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-800 ring-1 ring-black/10 transition hover:bg-zinc-50"
        >
          Share on Facebook
        </a>
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-800 ring-1 ring-black/10 transition hover:bg-zinc-50"
        >
          Share on WhatsApp
        </a>
        <a
          href={meme.imageUrl}
          download
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          Download image
        </a>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 border-b-2 border-accent pb-2 text-lg font-bold text-brand">
            More {meme.category} memes
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {related.map((m) => (
              <MemeCard key={m.id} meme={m} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
