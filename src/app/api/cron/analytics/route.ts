import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { snapshotAnalytics } from "@/lib/insights";

export const dynamic = "force-dynamic";

// Called once a day by Vercel Cron (see vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET".
// Without CRON_SECRET set, the route stays closed.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await snapshotAnalytics());
  } catch (err) {
    return errorResponse(err);
  }
}
