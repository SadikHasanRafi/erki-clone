import { decodeSlug } from "@/lib/format";
import { NextResponse } from "next/server";
import { getMemeBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

// Public: one published meme. Drafts return 404 so they cannot be guessed.
export async function GET(_request: Request, { params }: Ctx) {
  const slug = decodeSlug((await params).slug);
  const meme = await getMemeBySlug(slug);
  if (!meme || meme.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ meme });
}
