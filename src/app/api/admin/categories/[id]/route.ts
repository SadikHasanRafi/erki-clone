import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { deleteCategory, updateCategoryColor } from "@/lib/categories";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { color?: string } | null;
  if (!body?.color || !/^#[0-9a-fA-F]{6}$/.test(body.color)) {
    return NextResponse.json({ error: "Colour must look like #16a34a." }, { status: 400 });
  }
  try {
    const ok = await updateCategoryColor((await params).id, body.color);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const result = await deleteCategory((await params).id);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!result.ok) {
      return NextResponse.json(
        { error: `${result.inUse} meme(s) still use this category. Move them to another category first.` },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
