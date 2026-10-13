import { NextResponse } from "next/server";
import { listMemes } from "@/lib/store";

export const dynamic = "force-dynamic";

// Public: published memes, optionally filtered by ?category= and ?q=.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 24, 100);
  const memes = await listMemes({
    category: searchParams.get("category") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    limit,
  });
  return NextResponse.json({ memes });
}
