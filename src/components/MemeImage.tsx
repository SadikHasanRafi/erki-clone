"use client";

import Image from "next/image";
import { useState } from "react";

function Missing({ className = "" }: { className?: string }) {
  return (
    <div className={`grid place-items-center bg-zinc-100 p-2 text-center text-xs text-zinc-400 ${className}`}>
      ছবি পাওয়া যায়নি
    </div>
  );
}

// Fills its (relatively positioned) parent. Shows a placeholder when the image URL is dead.
export function MemeImage({
  src,
  alt,
  sizes,
  priority = false,
  fit = "cover",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (failedSrc === src) return <Missing className="absolute inset-0" />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      onError={() => setFailedSrc(src)}
      className={fit === "cover" ? "object-cover" : "object-contain"}
    />
  );
}

// Natural-size image for article pages, so tall memes are never cropped.
export function ArticleImage({ src, alt }: { src: string; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (failedSrc === src) return <Missing className="aspect-[4/3] w-full" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote or blob URL of unknown size
    <img src={src} alt={alt} onError={() => setFailedSrc(src)} className="h-auto w-full" />
  );
}

// Takes the image's own proportions (any size works). Very tall images are capped so one card cannot take over the page.
export function FlexImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (failedSrc === src) return <Missing className="aspect-[4/3] w-full" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote or blob URL of unknown size
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className="mx-auto block h-auto max-h-[640px] w-full object-contain"
    />
  );
}
