import { decodeSlug } from "@/lib/format";
import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/store";

type Ctx = { params: Promise<{ slug: string }> };

// Public: called once per page view from the browser.
export async function POST(_request: Request, { params }: Ctx) {
  const slug = decodeSlug((await params).slug);
  const views = await incrementViews(slug);
  if (views === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ views });
}
