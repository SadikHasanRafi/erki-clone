// Pure constants only: this file is imported by client components too, so no Node APIs here.

export const SITE_NAME = "Erki Clone";
export const SITE_TAGLINE = "Bangla memes, fresh every day";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Edit this list to change the sections shown on the site and in the dashboard.
export const CATEGORIES: string[] = [
  "Cricket",
  "Politics",
  "Campus",
  "Family",
  "Food",
  "Tech",
  "Random",
];

// Header/sidebar colour per category. Anything not listed falls back to the ink colour.
export const CATEGORY_COLORS: Record<string, string> = {
  Cricket: "#16a34a",
  Politics: "#dc2626",
  Campus: "#2563eb",
  Family: "#9333ea",
  Food: "#ea580c",
  Tech: "#0891b2",
  Random: "#52525b",
};

// Everything below controls how the public site is laid out. Edit it here; no code changes needed.
export const LABELS = {
  popular: "জনপ্রিয়",
  latest: "টাটকা",
  more: "আরও দেখুন",
  related: "আরও",
  loadMore: "আরও লোড করুন",
  home: "প্রচ্ছদ",
  search: "মিম খুঁজুন…",
  submitTitle: "আপনার মিম ও আইডিয়া পাঠান",
  submitButton: "পাঠান",
};

// Links in the "more" box. Use ?category=<name> to point at a section.
export const MORE_LINKS: { label: string; href: string }[] = [
  { label: "ক্রিকেট মিম", href: "/?category=Cricket" },
  { label: "রাজনীতির মিম", href: "/?category=Politics" },
  { label: "ক্যাম্পাসের মিম", href: "/?category=Campus" },
];

// Number of memes in each home-page block.
export const LAYOUT = { latestPageSize: 6, popularCount: 6, stripCount: 10, sidebarRecent: 6, perCategoryBlock: 4 };

// Leave empty to hide the matching footer item.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
export const SOCIAL_LINKS: { label: string; href: string }[] = process.env.NEXT_PUBLIC_FACEBOOK_URL
  ? [{ label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL }]
  : [];

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
