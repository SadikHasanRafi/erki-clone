import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    text?: string;
    targetLanguage?: string;
  } | null;

  if (!body?.text || !body?.targetLanguage) {
    return NextResponse.json(
      { error: "Missing text or targetLanguage" },
      { status: 400 }
    );
  }

  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", body.text);
    url.searchParams.set("langpair", `bn|${body.targetLanguage}`); // bn = Bangla, en = English

    const res = await fetch(url.toString());
    const data = (await res.json()) as {
      responseStatus: number;
      responseData?: {
        translatedText?: string;
      };
    };

    if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
      return NextResponse.json(
        { error: "Translation service error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText: data.responseData.translatedText,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    );
  }
}
