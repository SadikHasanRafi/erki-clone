// Shape and defaults of everything the dashboard can customise on the public site.
// Pure data only: imported by client components too, so no Node APIs here.

import { CONTACT_EMAIL, LABELS, LAYOUT, LOGO_SRC, SITE_NAME, SITE_TAGLINE, SOCIAL_LINKS } from "./config";

export type Labels = typeof LABELS;
export type LinkItem = { label: string; href: string };

export type HomeSectionId = "hero" | "hall" | "memeOfDay" | "latest" | "vault" | "leaderboard" | "tags";
export type SectionToggle = { id: HomeSectionId; enabled: boolean };

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  phone: string;
  address: string;
  socialLinks: LinkItem[];
  labels: Labels;
  layout: typeof LAYOUT & { latestCount: number; latestPageSize: number };
  display: {
    showWire: boolean; // scrolling headline strip under the header
    showTicker: boolean; // "Breaking" bar at the very top
    showPostViews: boolean; // eye counters on cards and articles
    showSiteVisits: boolean; // site-wide visit counter in the header and footer
  };
  home: {
    top: SectionToggle[]; // full width, above the columns
    main: SectionToggle[]; // left column
    sidebar: SectionToggle[]; // right column
  };
  // Meme ids pinned to each slot. Empty slots are filled automatically.
  placements: {
    hero: string;
    spicy: string[];
    hall: string[];
    memeOfDay: string;
    wire: string[];
    latest: string[];
  };
  footer: {
    note: string;
    links: LinkItem[];
    showContactForm: boolean;
  };
  about: { title: string; intro: string; body: string; imageUrl: string };
  contact: { title: string; intro: string; showForm: boolean; successMessage: string };
}

export const DEFAULT_LOGO = LOGO_SRC;
export const DEFAULT_FAVICON = "/favicon.png";

export const SECTION_NAMES: Record<HomeSectionId, string> = {
  hero: "Hero story + Spicy Dispatches",
  hall: "Viral Hall of Shame",
  memeOfDay: "Meme of the Day",
  latest: "Latest news (with Load More)",
  vault: "Satire Vault (one block per desk)",
  leaderboard: "Leaderboard: most viewed",
  tags: "Trending tags",
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: SITE_NAME,
  tagline: SITE_TAGLINE,
  logoUrl: DEFAULT_LOGO,
  faviconUrl: DEFAULT_FAVICON,
  contactEmail: CONTACT_EMAIL,
  phone: "",
  address: "",
  socialLinks: SOCIAL_LINKS,
  labels: LABELS,
  layout: { ...LAYOUT, latestCount: 6, latestPageSize: 6 },
  display: { showWire: true, showTicker: true, showPostViews: true, showSiteVisits: true },
  home: {
    top: [
      { id: "hero", enabled: true },
      { id: "hall", enabled: true },
    ],
    main: [
      { id: "memeOfDay", enabled: true },
      { id: "latest", enabled: true },
      { id: "vault", enabled: true },
    ],
    sidebar: [
      { id: "leaderboard", enabled: true },
      { id: "tags", enabled: true },
    ],
  },
  placements: { hero: "", spicy: [], hall: [], memeOfDay: "", wire: [], latest: [] },
  footer: { note: LABELS.rights, links: [], showContactForm: true },
  about: {
    title: "About Us",
    intro: SITE_TAGLINE,
    body: `${SITE_NAME} is a satirical news site. Everything published here is a work of internet comedy, not real news.\n\nWe collect the funniest memes, hoaxes and takes from across the web and write them up as if they were breaking stories.`,
    imageUrl: "",
  },
  contact: {
    title: "Contact Us",
    intro: "Got a tip, a meme, or a complaint? Send us a message and we'll get back to you.",
    showForm: true,
    successMessage: "Thanks! Your message has been sent.",
  },
};
