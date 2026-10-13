import Link from "next/link";
import { MemeImage } from "@/components/MemeImage";
import type { Meme } from "@/lib/types";

export function ThumbStrip({ memes }: { memes: Meme[] }) {
  if (memes.length === 0) return null;
  return (
    <div className="grid auto-cols-[8.5rem] grid-flow-col gap-2 overflow-x-auto px-4 py-4 md:auto-cols-fr md:overflow-visible">
      {memes.map((m) => (
        <Link key={m.id} href={`/meme/${m.slug}`} title={m.title} className="relative block aspect-[4/3] overflow-hidden bg-zinc-100 transition hover:opacity-80">
          <MemeImage src={m.imageUrl} alt={m.title} sizes="130px" />
        </Link>
      ))}
    </div>
  );
}
