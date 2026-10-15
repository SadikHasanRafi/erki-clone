import { NextResponse } from "next/server";
import { listMemes } from "@/lib/store";

export const dynamic = "force-dynamic";

// Public: published memes, optionally filtered by ?category=, ?tag= and ?q=.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 24, 100);
  const memes = await listMemes({
    category: searchParams.get("category") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    limit,
    excludeId: searchParams.get("excludeId") ?? undefined,
    // Comma-separated ids already on screen (pinned posts), so Load More never repeats them.
    excludeIds: searchParams.get("exclude")?.split(",").filter(Boolean).slice(0, 50),
    skip: Math.max(Number(searchParams.get("skip")) || 0, 0),
  });
  return NextResponse.json({ memes });
}
