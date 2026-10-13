import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { deleteMeme, getMemeById, updateMeme } from "@/lib/store";
import { deleteImage, saveImage } from "@/lib/uploads";
import { parseMemeForm } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// Admin: one meme, including drafts.
export async function GET(_request: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const meme = await getMemeById(id);
  if (!meme) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ meme });
}

// Admin: update fields. Sending a new image replaces the old file; omitting it keeps the current one.
export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const existing = await getMemeById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected form data." }, { status: 400 });

  const parsed = parseMemeForm(form, { requireImage: false });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    let newImageUrl: string | undefined;
    if (parsed.image) {
      newImageUrl = await saveImage(parsed.image);
    } else if (parsed.imageUrl) {
      newImageUrl = parsed.imageUrl;
    }

    const meme = await updateMeme(id, { ...parsed.input, imageUrl: newImageUrl });
    if (newImageUrl && newImageUrl !== existing.imageUrl) await deleteImage(existing.imageUrl);
    return NextResponse.json({ meme });
  } catch (err) {
    return errorResponse(err);
  }
}

// Admin: delete the meme and its image file.
export async function DELETE(_request: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const removed = await deleteMeme(id);
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteImage(removed.imageUrl);
  return NextResponse.json({ ok: true });
}
