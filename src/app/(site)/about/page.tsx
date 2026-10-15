import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { RichText } from "@/components/site/RichText";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getSettings();
  return { title: about.title, description: about.intro.slice(0, 160) || undefined };
}

export default async function AboutPage() {
  const { about, labels: L } = await getSettings();

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 md:px-10 md:py-12">
      <nav className="mb-6 flex items-center gap-2 font-display text-xs uppercase tracking-wider text-muted">
        <Link href="/" className="hover:text-ink">{L.home}</Link>
        <span className="text-neutral-300">/</span>
        <span className="font-semibold text-ink">{about.title}</span>
      </nav>

      <header className="mb-8 flex flex-col gap-4 border-b border-hairline pb-8">
        <span className="self-start rounded bg-amber-soft px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wider text-amber-deep">
          {L.about}
        </span>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink md:text-5xl">{about.title}</h1>
        {about.intro && <p className="font-serif text-lg leading-relaxed text-neutral-600 md:text-2xl">{about.intro}</p>}
      </header>

      {about.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- dashboard image of unknown size
        <img src={about.imageUrl} alt="" className="mb-8 w-full rounded-2xl border border-hairline object-cover shadow-card" />
      )}

      <RichText text={about.body} />

      <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-hairline bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-base font-semibold text-ink">{L.contact}</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-ink-2"
        >
          <Icon name="mail" className="h-3.5 w-3.5 text-amber" /> {L.contact}
        </Link>
      </div>
    </main>
  );
}
