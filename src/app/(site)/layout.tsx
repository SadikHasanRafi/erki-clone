import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
              E
            </span>
            <span className="text-lg font-semibold tracking-tight text-zinc-900">{SITE_NAME}</span>
          </Link>
          <span className="hidden text-sm text-zinc-500 sm:block">{SITE_TAGLINE}</span>
        </div>
      </header>

      <div className="min-h-[70vh]">{children}</div>

      <footer className="border-t border-black/5 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} {SITE_NAME}. {SITE_TAGLINE}.
      </footer>
    </>
  );
}
