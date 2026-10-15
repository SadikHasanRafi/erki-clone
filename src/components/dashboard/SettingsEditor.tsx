"use client";

import { useState } from "react";
import { DEFAULT_FAVICON, DEFAULT_LOGO, DEFAULT_SETTINGS, type SiteSettings } from "@/lib/site-settings";
import { Card, ImageField, LinkListEditor, NumberField, SaveBar, TextArea, TextField, Toggle, inputClass, useSettingsSaver } from "./fields";

const TABS = [
  { id: "general", label: "Branding & contact" },
  { id: "display", label: "Display & counts" },
  { id: "labels", label: "Text & labels" },
  { id: "footer", label: "Footer" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const LAYOUT_NAMES: Record<keyof SiteSettings["layout"], string> = {
  tickerCount: "Headlines in the ticker and wire strip",
  spicyCount: "Spicy Dispatches beside the hero",
  hallCount: "Viral Hall of Shame posts",
  leaderboardCount: "Leaderboard posts",
  perCategoryBlock: "Posts per desk in the Satire Vault",
  latestCount: "Latest News posts shown at first",
  latestPageSize: "Posts added per Load More / page",
  relatedCount: "Related posts on article pages",
};

// "loadMore" -> "Load more"
const humanize = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/ (\w)/g, (_, c: string) => ` ${c.toLowerCase()}`);

export function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState(initial);
  const [tab, setTab] = useState<Tab>("general");
  const [labelFilter, setLabelFilter] = useState("");
  const { save, busy, message, error } = useSettingsSaver();

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setS((prev) => ({ ...prev, [key]: value }));

  async function onSave() {
    const { siteName, tagline, logoUrl, faviconUrl, contactEmail, phone, address, socialLinks, labels, layout, display, footer } = s;
    const saved = await save({ siteName, tagline, logoUrl, faviconUrl, contactEmail, phone, address, socialLinks, labels, layout, display, footer });
    if (saved) setS(saved);
  }

  const labelKeys = (Object.keys(s.labels) as (keyof SiteSettings["labels"])[]).filter((k) => {
    const f = labelFilter.trim().toLowerCase();
    return !f || k.toLowerCase().includes(f) || s.labels[k].toLowerCase().includes(f);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <>
          <Card title="Branding" description="Name, logo and the little icon shown in the browser tab.">
            <TextField label="Site name" value={s.siteName} onChange={(v) => set("siteName", v)} maxLength={80} />
            <TextArea label="Tagline" value={s.tagline} onChange={(v) => set("tagline", v)} rows={2} maxLength={400} hint="Shown in the footer and used as the site description for search engines." />
            <ImageField label="Logo" value={s.logoUrl} onChange={(v) => set("logoUrl", v)} fallback={DEFAULT_LOGO} hint="Shown in the header and footer. A wide image with a transparent or white background works best." />
            <ImageField label="Browser tab icon (favicon)" value={s.faviconUrl} onChange={(v) => set("faviconUrl", v)} fallback={DEFAULT_FAVICON} hint="A square image, at least 64×64 px." />
          </Card>
          <Card title="Contact details" description="Shown on the Contact page and in the footer. Leave a field empty to hide it.">
            <TextField label="Email" type="email" value={s.contactEmail} onChange={(v) => set("contactEmail", v)} hint="Also enables the “Submit Meme” button in the header." />
            <TextField label="Phone" value={s.phone} onChange={(v) => set("phone", v)} maxLength={60} />
            <TextArea label="Address" value={s.address} onChange={(v) => set("address", v)} rows={2} maxLength={300} />
            <LinkListEditor label="Social links" hint="E.g. Facebook → https://facebook.com/yourpage" value={s.socialLinks} onChange={(v) => set("socialLinks", v)} />
          </Card>
        </>
      )}

      {tab === "display" && (
        <>
          <Card title="What to show">
            <Toggle label="Breaking ticker" hint="The thin bar with the newest headlines at the very top." checked={s.display.showTicker} onChange={(v) => set("display", { ...s.display, showTicker: v })} />
            <Toggle label="Wire dispatch strip" hint="The scrolling headline strip at the top of the home page." checked={s.display.showWire} onChange={(v) => set("display", { ...s.display, showWire: v })} />
            <Toggle label="Post view counts" hint="The eye counters on cards and article pages. Views are still counted when hidden." checked={s.display.showPostViews} onChange={(v) => set("display", { ...s.display, showPostViews: v })} />
            <Toggle label="Site visit counter" hint="Total visits to the site, shown in the top bar and the footer." checked={s.display.showSiteVisits} onChange={(v) => set("display", { ...s.display, showSiteVisits: v })} />
          </Card>
          <Card title="How many posts" description="Number of posts in each block of the site.">
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.keys(LAYOUT_NAMES) as (keyof SiteSettings["layout"])[]).map((k) => (
                <NumberField key={k} label={LAYOUT_NAMES[k]} value={s.layout[k]} onChange={(v) => set("layout", { ...s.layout, [k]: v })} />
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === "labels" && (
        <Card title="Text & labels" description="Every heading, button and note on the public site. Clear a box to restore its default.">
          <input value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} placeholder="Search labels…" aria-label="Search labels" className={inputClass} />
          <div className="grid gap-4 sm:grid-cols-2">
            {labelKeys.map((k) => (
              <TextField
                key={k}
                label={humanize(k)}
                value={s.labels[k]}
                placeholder={DEFAULT_SETTINGS.labels[k]}
                onChange={(v) => set("labels", { ...s.labels, [k]: v })}
                maxLength={200}
              />
            ))}
          </div>
        </Card>
      )}

      {tab === "footer" && (
        <Card title="Footer" description="The bottom of every page.">
          <TextField label="Bottom line note" value={s.footer.note} onChange={(v) => set("footer", { ...s.footer, note: v })} maxLength={300} hint="Shown after © year and the site name." />
          <Toggle label="Contact form in the footer" hint="Messages arrive in the dashboard inbox." checked={s.footer.showContactForm} onChange={(v) => set("footer", { ...s.footer, showContactForm: v })} />
          <LinkListEditor label="Extra footer links" hint="Added under Home, About Us and Contact Us." value={s.footer.links} onChange={(v) => set("footer", { ...s.footer, links: v })} />
        </Card>
      )}

      <SaveBar busy={busy} message={message} error={error} onSave={onSave} />
    </div>
  );
}
