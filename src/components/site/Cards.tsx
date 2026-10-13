import Link from "next/link";
import { FlexImage, MemeImage } from "@/components/MemeImage";
import { SITE_NAME } from "@/lib/config";
import type { Meme } from "@/lib/types";

export function SectionBar({ title, color }: { title: string; color?: string }) {
  return (
    <h2
      className={`px-3 py-2 text-center text-[15px] font-semibold ${color ? "text-white" : "bg-sun text-zinc-900"}`}
      style={color ? { backgroundColor: color } : undefined}
    >
      {title}
    </h2>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-2 top-2 z-[1] rounded bg-tag px-2.5 py-1 text-xs font-semibold text-zinc-900 shadow-sm">
      {children}
    </span>
  );
}

export function PopularCard({ meme }: { meme: Meme }) {
  return (
    <Link href={`/meme/${meme.slug}`} className="group block border-b border-zinc-300 pb-3">
      <div className="relative overflow-hidden bg-zinc-100">
        <Badge>{meme.category}</Badge>
        <FlexImage src={meme.imageUrl} alt={meme.title} />
      </div>
      <h3 className="mt-2.5 line-clamp-3 text-[17px] leading-snug text-zinc-800 group-hover:text-black group-hover:underline">
        {meme.title}
      </h3>
    </Link>
  );
}

export function LatestCard({ meme, priority = false }: { meme: Meme; priority?: boolean }) {
  return (
    <article className="group border-b border-zinc-300 pb-4">
      <Link href={`/meme/${meme.slug}`} className="block">
        <div className="relative overflow-hidden bg-zinc-100">
          <Badge>{meme.category}</Badge>
          <FlexImage src={meme.imageUrl} alt={meme.title} priority={priority} />
        </div>
        <h3 className="mt-3 text-xl leading-snug text-zinc-800 group-hover:underline md:text-[22px]">{meme.title}</h3>
      </Link>
      <p className="mt-2 text-xs text-zinc-400">{meme.author || SITE_NAME}</p>
      {meme.description && <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-zinc-600">{meme.description}</p>}
    </article>
  );
}

export function SmallRow({ meme }: { meme: Meme }) {
  return (
    <Link href={`/meme/${meme.slug}`} className="group flex gap-3 border-b border-zinc-200 py-3 last:border-0">
      <div className="relative aspect-[16/10] w-[110px] shrink-0 overflow-hidden bg-zinc-100 sm:w-[130px]">
        <MemeImage src={meme.imageUrl} alt={meme.title} sizes="130px" />
      </div>
      <h3 className="line-clamp-3 text-base leading-snug text-zinc-800 group-hover:underline">{meme.title}</h3>
    </Link>
  );
}
