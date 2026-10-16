"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "./Icon";
import { Logo } from "./Logo";
import { useSettings } from "./SettingsProvider";
import { SiteVisits } from "./SiteVisits";

type Headline = { title: string; slug: string };

// Small spinner inside a link while its page is loading, so a click always gives instant feedback.
function LinkPending() {
  const { pending } = useLinkStatus();
  return pending ? <span aria-hidden className="ml-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]" /> : null;
}

function SearchForm({ autoFocus = false, className = "" }: { autoFocus?: boolean; className?: string }) {
  const L = useSettings().labels;
  const q = useSearchParams().get("q") ?? "";
  return (
    <form action="/" role="search" className={`flex items-center rounded-full border border-hairline bg-subtle px-3.5 py-1.5 transition focus-within:border-amber focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-soft ${className}`}>
      <Icon name="search" className="mr-2 h-4 w-4 shrink-0 text-muted" />
      <input
        name="q"
        defaultValue={q}
        autoFocus={autoFocus}
        placeholder={L.search}
        aria-label={L.searchButton}
        className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-neutral-400"
      />
    </form>
  );
}

export function SiteHeader({ categories, headlines }: { categories: string[]; headlines: Headline[] }) {
  const { labels: L, contactEmail, socialLinks, display } = useSettings();
  const submitHref = contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent(L.submit)}` : "";
  const pathname = usePathname();
  const router = useRouter();
  const active = useSearchParams().get("category");
  const isArticle = pathname.startsWith("/meme/");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const close = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const pill = (on: boolean) =>
    `shrink-0 rounded-full px-3 py-1 text-xs transition ${on ? "bg-ink font-semibold text-white" : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-ink"}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline bg-white shadow-[0_2px_8px_rgba(18,19,22,0.06)]">
        {/* Breaking ticker: the newest headlines, tablet and up. */}
        {display.showTicker && headlines.length > 0 && (
          <div className="hidden border-b border-hairline bg-subtle md:block">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 lg:px-8">
              <span className="shrink-0 rounded-full bg-amber px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider text-white">
                {L.tickerBadge}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-6 overflow-hidden whitespace-nowrap text-xs text-neutral-600">
                {headlines.slice(0, 3).map((h, i) => (
                  <span key={h.slug} className="flex items-center gap-6">
                    {i > 0 && <span className="opacity-30" aria-hidden>•</span>}
                    <Link href={`/meme/${h.slug}`} className="hover:text-ink">{h.title}</Link>
                  </span>
                ))}
              </div>
              <SiteVisits className="shrink-0 font-display text-[11px] font-medium uppercase tracking-wider text-neutral-500" />
              <span className="hidden shrink-0 font-display text-[11px] font-medium uppercase tracking-wider text-neutral-400 lg:inline">
                {L.tickerNote}
              </span>
            </div>
          </div>
        )}

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-2 md:h-16 md:px-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-1 md:gap-8">
            {isArticle ? (
              <button type="button" aria-label="Back" onClick={() => router.back()} className="grid h-11 w-11 place-items-center text-ink md:hidden">
                <Icon name="back" className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Menu"
                aria-expanded={menuOpen}
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setSearchOpen(false);
                }}
                className="grid h-11 w-11 place-items-center text-ink md:hidden"
              >
                <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
              </button>
            )}
            {isArticle ? (
              <>
                <span className="font-display text-lg font-semibold tracking-tight text-ink md:hidden">{L.articleReader}</span>
                <Logo className="hidden h-8 md:block" priority />
              </>
            ) : (
              <Logo className="h-6 md:h-8" priority />
            )}
            <SearchForm className="hidden w-72 md:flex lg:w-80" />
          </div>

          <div className="flex items-center gap-1 md:gap-2.5">
            {socialLinks.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="hidden h-9 w-9 place-items-center rounded-full border border-hairline bg-white text-neutral-600 hover:text-ink md:grid"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
                </svg>
              </a>
            ))}
            {submitHref && (
              <a
                href={submitHref}
                className="hidden items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-display text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-ink-2 md:flex"
              >
                <Icon name="plus" className="h-3.5 w-3.5 text-amber" />
                {L.submit}
              </a>
            )}
            <button
              type="button"
              aria-label={L.searchButton}
              aria-expanded={searchOpen}
              onClick={() => {
                setSearchOpen((v) => !v);
                setMenuOpen(false);
              }}
              className="grid h-11 w-11 place-items-center text-ink-2 md:hidden"
            >
              <Icon name={searchOpen ? "close" : "search"} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-hairline px-4 py-2.5 md:hidden">
            <SearchForm autoFocus />
          </div>
        )}

        {menuOpen && (
          <nav className="grid grid-cols-2 gap-2 border-t border-hairline p-4 md:hidden" aria-label="Desks">
            <Link href="/" onClick={close} className={`${pill(!active && pathname === "/")} py-2 text-center`}>
              {L.trending}
              <LinkPending />
            </Link>
            {categories.map((c) => (
              <Link key={c} href={`/?category=${encodeURIComponent(c)}`} onClick={close} className={`${pill(active === c)} border border-hairline bg-white py-2 text-center`}>
                {c}
                <LinkPending />
              </Link>
            ))}
            <Link href="/about" onClick={close} className={`${pill(pathname === "/about")} border border-hairline bg-white py-2 text-center`}>
              {L.about}
            </Link>
            <Link href="/contact" onClick={close} className={`${pill(pathname === "/contact")} border border-hairline bg-white py-2 text-center`}>
              {L.contact}
            </Link>
          </nav>
        )}

        {/* Desk pills; on phones the article reader keeps the header compact. */}
        <nav className={`no-scrollbar overflow-x-auto border-t border-hairline px-4 py-2 lg:px-8 ${isArticle ? "hidden md:block" : ""}`} aria-label="Sections">
          <div className="mx-auto flex max-w-7xl items-center gap-1.5 whitespace-nowrap">
            <Link href="/" aria-current={!active && pathname === "/" ? "page" : undefined} className={pill(!active && pathname === "/")}>
              {L.trending}
              <LinkPending />
            </Link>
            {categories.map((c) => (
              <Link key={c} href={`/?category=${encodeURIComponent(c)}`} aria-current={active === c ? "page" : undefined} className={pill(active === c)}>
                {c}
                <LinkPending />
              </Link>
            ))}
            <span className="mx-1 h-4 w-px shrink-0 bg-hairline" aria-hidden />
            <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined} className={pill(pathname === "/about")}>
              {L.about}
            </Link>
            <Link href="/contact" aria-current={pathname === "/contact" ? "page" : undefined} className={pill(pathname === "/contact")}>
              {L.contact}
            </Link>
          </div>
        </nav>
      </header>

      {/* Phone bottom bar from the mobile design. Article pages use their own share bar instead. */}
      {!isArticle && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(18,19,22,0.06)] md:hidden" aria-label="Quick">
          <div className="flex h-16 items-center justify-around px-1">
            <BottomItem icon="home" label={L.home} href="/" on={pathname === "/" && !menuOpen && !searchOpen} onClick={close} />
            <BottomItem
              icon="grid"
              label={L.desks}
              on={menuOpen}
              onClick={() => {
                setMenuOpen((v) => !v);
                setSearchOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            {submitHref && (
              <a href={submitHref} className="flex w-14 flex-col items-center justify-center text-muted">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
                  <Icon name="plus" className="h-5 w-5" />
                </span>
                <span className="mt-0.5 font-display text-[10px] font-semibold tracking-tight">Submit</span>
              </a>
            )}
            <BottomItem
              icon="search"
              label={L.searchButton}
              on={searchOpen}
              onClick={() => {
                setSearchOpen((v) => !v);
                setMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            <BottomItem icon="trending" label="Top" href="/#hall-of-shame" onClick={close} />
          </div>
        </nav>
      )}
    </>
  );
}

function BottomItem({ icon, label, href, on = false, onClick }: { icon: IconName; label: string; href?: string; on?: boolean; onClick?: () => void }) {
  const className = `flex h-14 w-14 flex-col items-center justify-center transition-colors ${on ? "font-bold text-ink" : "text-muted hover:text-ink"}`;
  const inner = (
    <>
      <Icon name={icon} className="h-[22px] w-[22px]" />
      <span className="mt-0.5 font-display text-[10px] font-semibold tracking-tight">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} onClick={onClick} className={className}>{inner}</Link>
  ) : (
    <button type="button" onClick={onClick} aria-pressed={on} className={className}>{inner}</button>
  );
}
