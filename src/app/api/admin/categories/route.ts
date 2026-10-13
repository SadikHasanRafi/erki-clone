import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { addCategory, listCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ categories: await listCategories() });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { name?: string; color?: string } | null;
  const name = body?.name?.trim() ?? "";
  const color = body?.color ?? "#52525b";
  if (!name || name.length > 30) return NextResponse.json({ error: "Name is required (max 30 characters)." }, { status: 400 });
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return NextResponse.json({ error: "Colour must look like #16a34a." }, { status: 400 });

  try {
    return NextResponse.json({ category: await addCategory(name, color) }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && /E11000/.test(err.message)) {
      return NextResponse.json({ error: "A category with that name already exists." }, { status: 409 });
    }
    return errorResponse(err);
  }
}
