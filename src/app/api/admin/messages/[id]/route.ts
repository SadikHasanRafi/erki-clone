import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { deleteMessage, setMessageRead } from "@/lib/messages";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as { read?: unknown } | null;
  if (typeof body?.read !== "boolean") return NextResponse.json({ error: "read must be true or false." }, { status: 400 });
  try {
    const ok = await setMessageRead((await params).id, body.read);
    return ok ? NextResponse.json({ ok }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const ok = await deleteMessage((await params).id);
    return ok ? NextResponse.json({ ok }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    return errorResponse(err);
  }
}
