import Link from "next/link";
import { CATEGORIES, CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE, SOCIAL_LINKS } from "@/lib/config";

export function SiteFooter() {
  const hasContact = Boolean(CONTACT_EMAIL) || SOCIAL_LINKS.length > 0;
  return (
    <footer className="mt-12 bg-zinc-900 text-zinc-300">
      <div className="mx-auto grid max-w-[1312px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-sun text-base text-zinc-900">{SITE_NAME[0]}</span>
            {SITE_NAME}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">{SITE_TAGLINE}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sun">Sections</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`/?category=${encodeURIComponent(c)}`} className="hover:text-white hover:underline">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {hasContact && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sun">Contact</h3>
            <ul className="space-y-2 text-sm">
              {CONTACT_EMAIL && (
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="break-all hover:text-white hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              )}
              {SOCIAL_LINKS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
