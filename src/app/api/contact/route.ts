import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { createMessage } from "@/lib/messages";

export const dynamic = "force-dynamic";

const field = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Public: the contact form on /contact and in the footer. Messages show up in the dashboard inbox.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Hidden "website" field: people never see it, bots fill it in. Pretend success so they move on.
  if (field(body.website, 200)) return NextResponse.json({ ok: true });

  const name = field(body.name, 100);
  const email = field(body.email, 200);
  const subject = field(body.subject, 200);
  const message = field(body.message, 5000);
  if (!name || !message) return NextResponse.json({ error: "Please fill in your name and message." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  try {
    await createMessage({ name, email, subject, message });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
