import { cache } from "react";
import { settingsCollection } from "./db";
import {
  DEFAULT_SETTINGS,
  type HomeSectionId,
  type LinkItem,
  type SectionToggle,
  type SiteSettings,
} from "./site-settings";

const SETTINGS_ID = "site";

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

function str(v: unknown, fallback: string, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function int(v: unknown, fallback: number, min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

// Only web, mail, phone and same-site links: a "javascript:" href would run script on click.
export function safeHref(href: string): string {
  const h = href.trim();
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(h) ? h : "";
}

// Images may come from the web or from /public.
function safeSrc(v: unknown, fallback: string): string {
  const s = str(v, fallback, 1000);
  if (!s) return fallback;
  return /^(https?:\/\/|\/(?!\/))/i.test(s) ? s : fallback;
}

function links(v: unknown, fallback: LinkItem[]): LinkItem[] {
  if (!Array.isArray(v)) return fallback;
  return v
    .filter(isObj)
    .map((l) => ({ label: str(l.label, "", 60), href: safeHref(str(l.href, "", 500)) }))
    .filter((l) => l.label && l.href)
    .slice(0, 20);
}

function ids(v: unknown, max = 20): string[] {
  if (!Array.isArray(v)) return [];
  const clean = v.filter((x): x is string => typeof x === "string" && /^[a-f0-9]{1,48}$/i.test(x));
  return [...new Set(clean)].slice(0, max);
}

function id(v: unknown): string {
  return ids([v])[0] ?? "";
}

// Keeps the saved order, drops unknown ids and appends any section the defaults have but the save lacks.
function sections(v: unknown, fallback: SectionToggle[]): SectionToggle[] {
  const allowed = new Set<HomeSectionId>(fallback.map((s) => s.id));
  const out: SectionToggle[] = [];
  if (Array.isArray(v)) {
    for (const s of v.filter(isObj)) {
      const sid = s.id as HomeSectionId;
      if (allowed.has(sid) && !out.some((o) => o.id === sid)) out.push({ id: sid, enabled: bool(s.enabled, true) });
    }
  }
  for (const s of fallback) if (!out.some((o) => o.id === s.id)) out.push(s);
  return out;
}

// Turns whatever is stored (or posted from the dashboard) into a complete, safe settings object.
export function sanitizeSettings(raw: unknown): SiteSettings {
  const d = DEFAULT_SETTINGS;
  const r = isObj(raw) ? raw : {};
  const labelsIn = isObj(r.labels) ? r.labels : {};
  const layoutIn = isObj(r.layout) ? r.layout : {};
  const displayIn = isObj(r.display) ? r.display : {};
  const homeIn = isObj(r.home) ? r.home : {};
  const placeIn = isObj(r.placements) ? r.placements : {};
  const footerIn = isObj(r.footer) ? r.footer : {};
  const aboutIn = isObj(r.about) ? r.about : {};
  const contactIn = isObj(r.contact) ? r.contact : {};

  const labels = Object.fromEntries(
    Object.entries(d.labels).map(([k, v]) => [k, str(labelsIn[k], v, 200) || v]),
  ) as SiteSettings["labels"];

  const layout = Object.fromEntries(
    Object.entries(d.layout).map(([k, v]) => [k, int(layoutIn[k], v, 1, 50)]),
  ) as SiteSettings["layout"];

  return {
    siteName: str(r.siteName, d.siteName, 80) || d.siteName,
    tagline: str(r.tagline, d.tagline, 400),
    logoUrl: safeSrc(r.logoUrl, d.logoUrl),
    faviconUrl: safeSrc(r.faviconUrl, d.faviconUrl),
    contactEmail: str(r.contactEmail, d.contactEmail, 200),
    phone: str(r.phone, d.phone, 60),
    address: str(r.address, d.address, 300),
    socialLinks: links(r.socialLinks, d.socialLinks),
    labels,
    layout,
    display: {
      showWire: bool(displayIn.showWire, d.display.showWire),
      showTicker: bool(displayIn.showTicker, d.display.showTicker),
      showPostViews: bool(displayIn.showPostViews, d.display.showPostViews),
      showSiteVisits: bool(displayIn.showSiteVisits, d.display.showSiteVisits),
    },
    home: {
      top: sections(homeIn.top, d.home.top),
      main: sections(homeIn.main, d.home.main),
      sidebar: sections(homeIn.sidebar, d.home.sidebar),
    },
    placements: {
      hero: id(placeIn.hero),
      spicy: ids(placeIn.spicy),
      hall: ids(placeIn.hall),
      memeOfDay: id(placeIn.memeOfDay),
      wire: ids(placeIn.wire),
      latest: ids(placeIn.latest),
    },
    footer: {
      note: str(footerIn.note, d.footer.note, 300),
      links: links(footerIn.links, d.footer.links),
      showContactForm: bool(footerIn.showContactForm, d.footer.showContactForm),
    },
    about: {
      title: str(aboutIn.title, d.about.title, 120) || d.about.title,
      intro: str(aboutIn.intro, d.about.intro, 600),
      body: str(aboutIn.body, d.about.body, 20000),
      imageUrl: aboutIn.imageUrl === "" ? "" : safeSrc(aboutIn.imageUrl, d.about.imageUrl),
    },
    contact: {
      title: str(contactIn.title, d.contact.title, 120) || d.contact.title,
      intro: str(contactIn.intro, d.contact.intro, 1000),
      showForm: bool(contactIn.showForm, d.contact.showForm),
      successMessage: str(contactIn.successMessage, d.contact.successMessage, 300) || d.contact.successMessage,
    },
  };
}

// One read per request, however many components ask. Falls back to defaults if the database is down.
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const doc = await (await settingsCollection()).findOne({ _id: SETTINGS_ID });
    return sanitizeSettings(doc?.data);
  } catch (err) {
    console.error("Could not load site settings, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
});

// Top-level keys in the patch replace the stored ones; everything else is kept.
export async function saveSettings(patch: unknown): Promise<SiteSettings> {
  const collection = await settingsCollection();
  const current = (await collection.findOne({ _id: SETTINGS_ID }))?.data;
  const merged = { ...(isObj(current) ? current : {}), ...(isObj(patch) ? patch : {}) };
  const data = sanitizeSettings(merged);
  await collection.updateOne(
    { _id: SETTINGS_ID },
    { $set: { data, updatedAt: new Date().toISOString() } },
    { upsert: true },
  );
  return data;
}
