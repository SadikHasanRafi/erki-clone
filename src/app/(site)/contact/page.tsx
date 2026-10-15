import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/site/ContactForm";
import { Icon } from "@/components/site/Icon";
import { RichText } from "@/components/site/RichText";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { contact } = await getSettings();
  return { title: contact.title, description: contact.intro.slice(0, 160) || undefined };
}

export default async function ContactPage() {
  const { contact, contactEmail, phone, address, socialLinks, labels: L } = await getSettings();
  const details = [
    contactEmail && { icon: "mail" as const, label: contactEmail, href: `mailto:${contactEmail}` },
    phone && { icon: "phone" as const, label: phone, href: `tel:${phone.replace(/\s+/g, "")}` },
    address && { icon: "pin" as const, label: address, href: "" },
  ].filter((d): d is { icon: "mail" | "phone" | "pin"; label: string; href: string } => Boolean(d));

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <nav className="mb-6 flex items-center gap-2 font-display text-xs uppercase tracking-wider text-muted">
        <Link href="/" className="hover:text-ink">{L.home}</Link>
        <span className="text-neutral-300">/</span>
        <span className="font-semibold text-ink">{contact.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink md:text-5xl">{contact.title}</h1>
          {contact.intro && <RichText text={contact.intro} className="text-neutral-600" />}

          {details.length > 0 && (
            <ul className="flex flex-col gap-3">
              {details.map((d) => (
                <li key={d.icon} className="flex items-start gap-3 rounded-xl border border-hairline bg-white p-4 shadow-card">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-soft text-amber-deep">
                    <Icon name={d.icon} className="h-4 w-4" />
                  </span>
                  {d.href ? (
                    <a href={d.href} className="self-center break-all text-sm font-medium text-ink hover:text-amber-deep">{d.label}</a>
                  ) : (
                    <span className="self-center text-sm font-medium text-ink">{d.label}</span>
                  )}
                </li>
              ))}
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
                  className="rounded-full border border-hairline bg-white px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-neutral-600 transition hover:border-ink hover:text-ink"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {contact.showForm && (
          <section className="rounded-2xl border border-hairline bg-white p-5 shadow-card md:p-8 lg:col-span-7">
            <h2 className="mb-5 font-display text-sm font-bold uppercase tracking-wider text-ink">{L.formSend}</h2>
            <ContactForm />
          </section>
        )}
      </div>
    </main>
  );
}
