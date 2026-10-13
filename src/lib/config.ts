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

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
