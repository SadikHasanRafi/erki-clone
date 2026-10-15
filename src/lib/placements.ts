import type { Meme } from "./types";

// Pinned memes first (in the dashboard's order), then automatic picks that aren't already shown.
export function fillSlots(pinned: Meme[], auto: Meme[], count: number, taken: Set<string> = new Set()): Meme[] {
  const out: Meme[] = [];
  for (const m of [...pinned, ...auto]) {
    if (out.length >= count) break;
    if (taken.has(m.id) || out.some((o) => o.id === m.id)) continue;
    out.push(m);
  }
  return out;
}
