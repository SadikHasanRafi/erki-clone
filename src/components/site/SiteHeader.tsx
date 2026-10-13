"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, LABELS, SITE_NAME, SOCIAL_LINKS } from "@/lib/config";

export function SiteHeader() {
  const active = useSearchParams().get("category");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-sun shadow-sm">
      <div className="flex items-center gap-1 px-4">
        <Link href="/" className="mr-3 flex shrink-0 items-center gap-2 py-2.5" onClick={() => setMenuOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-md bg-zinc-900 text-base font-bold text-sun">{SITE_NAME[0]}</span>
          <span className="text-xl font-bold tracking-tight text-zinc-900">{SITE_NAME}</span>
        </Link>

        <nav className="hidden flex-1 items-center lg:flex" aria-label="Sections">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className={`px-3 py-3.5 text-[15px] transition ${active === c ? "bg-tag font-semibold" : "hover:bg-sun-dark"}`}
            >
              {c}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center">
          {SOCIAL_LINKS.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="p-3 hover:bg-sun-dark">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
              </svg>
            </a>
          ))}
          <button type="button" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen((v) => !v)} className="p-3 hover:bg-sun-dark">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <button type="button" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="p-3 hover:bg-sun-dark lg:hidden">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {searchOpen && (
        <form action="/" className="flex gap-2 border-t border-black/10 bg-sun-dark/60 px-4 py-2.5">
          <input
            name="q"
            autoFocus
            placeholder={LABELS.search}
            className="min-w-0 flex-1 border border-zinc-400 bg-white px-3 py-2 outline-none focus:border-zinc-900"
          />
          <button className="bg-zinc-900 px-4 py-2 font-semibold text-sun hover:bg-black">খুঁজুন</button>
        </form>
      )}

      {menuOpen && (
        <nav className="grid grid-cols-2 border-t border-black/10 bg-sun lg:hidden" aria-label="Sections">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              onClick={() => setMenuOpen(false)}
              className={`border-b border-black/5 px-4 py-3 text-[15px] ${active === c ? "bg-tag font-semibold" : "hover:bg-sun-dark"}`}
            >
              {c}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
