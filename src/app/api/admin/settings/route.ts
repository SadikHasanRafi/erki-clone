import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { getSettings, saveSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ settings: await getSettings() });
}

// Accepts any subset of the top-level settings keys; the rest stay as they are.
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid settings." }, { status: 400 });
  try {
    return NextResponse.json({ settings: await saveSettings(body) });
  } catch (err) {
    return errorResponse(err);
  }
}
