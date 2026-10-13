import Image from "next/image";
import Link from "next/link";
import type { Meme } from "@/lib/types";

// Memes come in all shapes, so the image is contained inside a fixed box instead of cropped.
export function MemeImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      className="object-contain"
    />
  );
}

export function MemeCard({ meme }: { meme: Meme }) {
  return (
    <Link
      href={`/meme/${meme.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] bg-zinc-100">
        <MemeImage
          src={meme.imageUrl}
          alt={meme.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          {meme.category}
        </span>
        <h3 className="line-clamp-2 font-semibold leading-snug text-zinc-900 group-hover:text-brand">
          {meme.title}
        </h3>
        <span className="mt-auto pt-1 text-xs text-zinc-500">
          {meme.views.toLocaleString("bn-BD")} views
        </span>
      </div>
    </Link>
  );
}
