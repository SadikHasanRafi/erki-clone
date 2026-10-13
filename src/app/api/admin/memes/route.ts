import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { createMeme, listMemes } from "@/lib/store";
import { saveImage } from "@/lib/uploads";
import { parseMemeForm } from "@/lib/validation";

export const dynamic = "force-dynamic";

// Admin: every meme, including drafts.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ memes: await listMemes({ includeDrafts: true }) });
}

// Admin: create a meme from multipart form data (image + fields).
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected form data." }, { status: 400 });

  const parsed = parseMemeForm(form, { requireImage: true });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (!parsed.image && !parsed.imageUrl) return NextResponse.json({ error: "Please choose an image." }, { status: 400 });

  try {
    const imageUrl = parsed.imageUrl || (parsed.image ? await saveImage(parsed.image) : null);
    if (!imageUrl) return NextResponse.json({ error: "Failed to process image." }, { status: 400 });

    const meme = await createMeme(parsed.input, imageUrl);
    return NextResponse.json({ meme }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
