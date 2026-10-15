// Pure constants only: this file is imported by client components too, so no Node APIs here.

export const SITE_NAME = "Amiami Post";
export const SITE_TAGLINE = "The web's most aggressively unserious journalistic establishment. Chronicling digital brainrot, corporate absurdities, and elite meme warfare.";
// Logo lives in /public; the space-containing file name is URL-encoded.
export const LOGO_SRC = "/Glossy%20Amiami%20Post%20Mascot%20Sticker.png";
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

// Defaults for the public site's text and layout. The dashboard's Settings page overrides them.
export const LABELS = {
  tickerBadge: "Breaking",
  tickerNote: "100% Satirical News",
  wire: "Wire Dispatch",
  wireNote: "Live Feed 24/7",
  trending: "Trending",
  edition: "Amiami Edition",
  spicy: "Spicy Dispatches",
  spicyNote: "Top Satire",
  hallOfShame: "Viral Hall of Shame",
  hallNote: "Real-Time Ranking",
  memeOfDay: "Meme of the Day",
  curatorPicks: "Curator Picks",
  vault: "The Satire Vault",
  vaultNote: "Fresh Run",
  leaderboard: "Leaderboard: Most Viewed",
  leaderboardNote: "All Time",
  tags: "Trending Meme Tags",
  viewAll: "View All",
  loadMore: "Load More Absurdities",
  loading: "Loading…",
  loadError: "Couldn't load more. Check your connection and try again.",
  empty: "Nothing here yet. Check back soon!",
  emptyFiltered: "No memes match this filter.",
  home: "Home",
  desks: "Desks",
  search: "Search memes, hoaxes, takes...",
  searchButton: "Search",
  submit: "Submit Meme",
  prev: "‹ Prev",
  next: "Next ›",
  source: "Original post",
  filedUnder: "Filed Under",
  prevPost: "Previous Hoax",
  nextPost: "Next Hoax",
  deskDispatch: "Desk Dispatch",
  moreFromDesk: "More From This Desk",
  mostRead: "Most Read",
  articleReader: "Article Reader",
  share: "Share",
  copyLink: "Copy link",
  copied: "Copied!",
  download: "Download",
  views: "views",
  minRead: "min read",
  footerDesks: "Desk Directory",
  rights: "All satirical claims are fictional works of internet comedy.",
  latest: "Latest News",
  latestNote: "Fresh Off The Press",
  about: "About Us",
  contact: "Contact Us",
  pages: "Company",
  visits: "visits",
  backToTop: "Back to top",
  formName: "Your name",
  formEmail: "Your email",
  formSubject: "Subject",
  formMessage: "Your message",
  formSend: "Send message",
  formSending: "Sending…",
  formError: "Couldn't send your message. Please try again.",
};

// Number of memes in each home-page block.
export const LAYOUT = {
  tickerCount: 6, // header ticker and home wire headlines
  spicyCount: 3, // cards beside the hero
  hallCount: 5, // Viral Hall of Shame
  leaderboardCount: 5,
  perCategoryBlock: 3, // cards per desk in the Satire Vault
  latestPageSize: 6, // results per page when filtering by desk, tag or search
  relatedCount: 4,
};

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
