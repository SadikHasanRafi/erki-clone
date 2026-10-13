import Link from "next/link";
import { CATEGORY_COLORS, CONTACT_EMAIL, LABELS, MORE_LINKS } from "@/lib/config";
import type { Meme } from "@/lib/types";
import { SectionBar, SmallRow } from "./Cards";

export function MoreBox() {
  if (MORE_LINKS.length === 0) return null;
  return (
    <section className="overflow-hidden rounded border border-zinc-200 bg-white">
      <h2 className="border-b border-zinc-200 bg-blue-50 px-4 py-3 text-lg text-zinc-800">{LABELS.more}</h2>
      <ul>
        {MORE_LINKS.map((l) => (
          <li key={l.href} className="border-b border-zinc-200 last:border-0">
            <Link href={l.href} className="flex items-center justify-between px-4 py-3.5 text-zinc-800 hover:bg-zinc-50">
              {l.label}
              <span aria-hidden className="text-zinc-400">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SubmitBanner() {
  if (!CONTACT_EMAIL) return null;
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(LABELS.submitTitle)}`}
      className="block bg-sun px-6 py-8 text-center transition hover:bg-sun-dark"
    >
      <p className="text-xl font-semibold text-zinc-900">{LABELS.submitTitle}</p>
      <span className="mt-4 inline-block bg-zinc-900 px-8 py-2.5 text-lg font-semibold text-white">{LABELS.submitButton}</span>
    </a>
  );
}

export function RecentList({ memes }: { memes: Meme[] }) {
  if (memes.length === 0) return null;
  return (
    <section>
      {memes.map((m) => (
        <SmallRow key={m.id} meme={m} />
      ))}
    </section>
  );
}

export function CategoryBlocks({ blocks }: { blocks: { category: string; memes: Meme[] }[] }) {
  return (
    <div className="space-y-5">
      {blocks
        .filter((b) => b.memes.length > 0)
        .map((b) => (
          <section key={b.category}>
            <Link href={`/?category=${encodeURIComponent(b.category)}`} className="block">
              <SectionBar title={b.category} color={CATEGORY_COLORS[b.category] ?? "#1c1917"} />
            </Link>
            <div className="px-1">
              {b.memes.map((m) => (
                <SmallRow key={m.id} meme={m} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
