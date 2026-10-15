"use client";

import Image from "next/image";
import Link from "next/link";
import { DEFAULT_LOGO } from "@/lib/site-settings";
import { useSettings } from "./SettingsProvider";

// The built-in 2170×725 sticker PNG has its lettering in the box x 110–2050, y 190–486 on a white matte.
// The frame (aspect 1940:296) crops to that box, and multiply blending drops the white matte
// into whatever light surface sits behind it. A logo uploaded in the dashboard is shown as-is.
// Size the logo by height only.
export function Logo({ className = "h-7 md:h-8", priority = false }: { className?: string; priority?: boolean }) {
  const { logoUrl, siteName } = useSettings();

  if (logoUrl !== DEFAULT_LOGO) {
    return (
      <Link href="/" aria-label={`${siteName} home`} className={`block shrink-0 transition-opacity hover:opacity-90 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded logo of unknown size */}
        <img src={logoUrl} alt={siteName} className="h-full w-auto max-w-[220px] object-contain" />
      </Link>
    );
  }

  return (
    <Link href="/" aria-label={`${siteName} home`} className={`relative block aspect-1940/296 shrink-0 overflow-hidden transition-opacity hover:opacity-90 ${className}`}>
      <Image
        src={DEFAULT_LOGO}
        alt={siteName}
        width={2170}
        height={725}
        priority={priority}
        sizes="240px"
        className="absolute left-[-5.67%] top-[-64.2%] h-auto w-[111.86%] max-w-none mix-blend-multiply"
      />
    </Link>
  );
}
