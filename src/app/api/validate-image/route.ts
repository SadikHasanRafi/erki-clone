import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    url?: string;
  } | null;

  if (!body?.url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const response = await fetch(body.url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    const contentType = response.headers.get("content-type");
    const isImage = contentType?.startsWith("image/");

    if (!response.ok || !isImage) {
      return NextResponse.json(
        { error: "Invalid image URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to validate image" },
      { status: 400 }
    );
  }
}
