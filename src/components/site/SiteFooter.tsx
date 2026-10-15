"use client";

import Link from "next/link";
import { ContactForm } from "./ContactForm";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { useSettings } from "./SettingsProvider";
import { SiteVisits } from "./SiteVisits";

const heading = "font-display text-xs font-bold uppercase tracking-wider text-ink";
const link = "text-xs text-neutral-500 transition-colors hover:text-ink";

export function SiteFooter({ categories }: { categories: string[] }) {
  const { siteName, tagline, labels: L, socialLinks, contactEmail, phone, address, footer } = useSettings();
  const pages = [{ label: L.home, href: "/" }, { label: L.about, href: "/about" }, { label: L.contact, href: "/contact" }, ...footer.links];

  return (
    <footer className="mt-16 border-t border-hairline bg-subtle">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-2 md:px-10 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <Logo className="h-7 self-start" />
          <p className="max-w-sm text-xs leading-relaxed text-neutral-500">{tagline}</p>
          {(contactEmail || phone || address) && (
            <ul className="flex flex-col gap-2 text-xs text-neutral-600">
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 hover:text-ink">
                    <Icon name="mail" className="h-3.5 w-3.5 text-amber-deep" /> {contactEmail}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 hover:text-ink">
                    <Icon name="phone" className="h-3.5 w-3.5 text-amber-deep" /> {phone}
                  </a>
                </li>
              )}
              {address && (
                <li className="inline-flex items-start gap-2">
                  <Icon name="pin" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-deep" /> {address}
                </li>
              )}
            </ul>
          )}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-hairline bg-white px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-neutral-600 transition hover:border-ink hover:text-ink"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {categories.length > 0 && (
          <nav className="flex flex-col gap-3 lg:col-span-3" aria-label={L.footerDesks}>
            <h3 className={heading}>{L.footerDesks}</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {categories.map((c) => (
                <li key={c}>
                  <Link href={`/?category=${encodeURIComponent(c)}`} className={link}>{c}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <nav className="flex flex-col gap-3 lg:col-span-2" aria-label={L.pages}>
          <h3 className={heading}>{L.pages}</h3>
          <ul className="flex flex-col gap-2">
            {pages.map((p) => (
              <li key={`${p.label}-${p.href}`}>
                <Link href={p.href} className={link}>{p.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {footer.showContactForm && (
          <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-3">
            <h3 className={heading}>{L.contact}</h3>
            <ContactForm compact />
          </div>
        )}
      </div>

      {/* Bottom line: copyright, quick links, visit counter and a back-to-top button. */}
      <div className="bg-ink text-white/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-5 py-4 text-center text-[11px] md:flex-row md:justify-between md:px-10 md:text-left lg:px-8">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold text-white">{siteName}</span>
            {footer.note && <span className="text-white/50"> · {footer.note}</span>}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/about" className="transition-colors hover:text-amber">{L.about}</Link>
            <Link href="/contact" className="transition-colors hover:text-amber">{L.contact}</Link>
            <SiteVisits className="rounded-full bg-white/10 px-2.5 py-1 text-white/80" />
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 transition hover:border-amber hover:text-amber"
            >
              <Icon name="up" className="h-3 w-3" /> {L.backToTop}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
