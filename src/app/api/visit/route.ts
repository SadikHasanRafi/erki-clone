import { NextResponse } from "next/server";
import { getSiteVisits, incrementSiteVisits } from "@/lib/stats";

export const dynamic = "force-dynamic";

// Public: GET reads the site-wide visit count, POST adds one visit and returns the new total.
export async function GET() {
  return NextResponse.json({ visits: await getSiteVisits() });
}

export async function POST() {
  return NextResponse.json({ visits: await incrementSiteVisits() });
}
