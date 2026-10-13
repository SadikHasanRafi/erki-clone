import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleImage } from "@/components/MemeImage";
import { SectionBar, SmallRow } from "@/components/site/Cards";
import { CategoryBlocks, MoreBox } from "@/components/site/Sidebar";
import { ViewCounter } from "@/components/ViewCounter";
import { listCategories } from "@/lib/categories";
import { LABELS, LAYOUT, SITE_NAME, SITE_URL } from "@/lib/config";
import { decodeSlug, formatDate } from "@/lib/format";
import { getMemeBySlug, listMemes } from "@/lib/store";
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

export default async function MemePage({ params }: Props) {
  const meme = await findPublished(decodeSlug((await params).slug));
  if (!meme) notFound();

  const categories = await listCategories();
  const [related, blocks] = await Promise.all([
    listMemes({ category: meme.category, excludeId: meme.id, limit: 6 }),
    Promise.all(
      categories.map(async ({ name: category, color }) => ({
        category,
        color,
        memes: await listMemes({ category, excludeId: meme.id, limit: LAYOUT.perCategoryBlock }),
      })),
    ),
  ]);

  const url = `${SITE_URL}/meme/${meme.slug}`;
  const shareText = encodeURIComponent(`${meme.title} ${url}`);
  const author = meme.author || SITE_NAME;
  const paragraphs = (meme.body ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="px-4 pb-4">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-sky-700">
        <Link href="/" className="hover:underline">{LABELS.home}</Link>
        <span aria-hidden>›</span>
        <Link href={`/?category=${encodeURIComponent(meme.category)}`} className="hover:underline">
          {meme.category}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <MoreBox />

          <h1 className="mt-8 text-3xl leading-tight text-zinc-900 md:text-4xl">{meme.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sun text-lg font-bold text-zinc-900" aria-hidden>
              {author[0]}
            </span>
            <div className="text-sm">
              <p className="font-semibold text-zinc-800">{author}</p>
              <p className="text-zinc-500">
                {formatDate(meme.createdAt)} · <ViewCounter slug={meme.slug} initial={meme.views} />
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden bg-zinc-50">
            <ArticleImage src={meme.imageUrl} alt={meme.title} />
          </div>

          <div className="mt-6 space-y-5 text-lg leading-[1.9] text-zinc-800">
            {meme.description && <p className={`whitespace-pre-line ${paragraphs.length ? "font-medium text-zinc-900" : ""}`}>{meme.description}</p>}
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </div>

          {meme.sourceUrl && (
            <p className="mt-6 text-base">
              <span className="text-zinc-500">{LABELS.source}: </span>
              <a
                href={meme.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="break-all text-sky-700 hover:underline"
              >
                {meme.sourceUrl}
              </a>
            </p>
          )}

          {meme.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {meme.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/?tag=${encodeURIComponent(tag)}`} className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 hover:bg-sun">
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap gap-2.5 border-y border-zinc-200 py-4">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1877f2] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Facebook-এ শেয়ার
            </a>
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25d366] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              WhatsApp-এ শেয়ার
            </a>
            <a href={meme.imageUrl} download className="bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
              ছবি ডাউনলোড
            </a>
          </div>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="bg-tag px-3 py-2 text-[15px] font-semibold text-zinc-900">{LABELS.related}</h2>
              <div className="mt-2 grid gap-x-8 md:grid-cols-2">
                {related.map((m) => (
                  <SmallRow key={m.id} meme={m} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <SectionBar title={LABELS.latest} />
          <div className="mt-5">
            <CategoryBlocks blocks={blocks} />
          </div>
        </aside>
      </div>
    </article>
  );
}
