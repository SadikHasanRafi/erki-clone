import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { RANGES, getInsights } from "@/lib/insights";
import { buildInsightsJson, buildInsightsPdf } from "@/lib/insights-export";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Downloads the Insights report: /api/admin/insights/export?days=7|30&format=pdf|json
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const days = RANGES.includes(Number(searchParams.get("days"))) ? Number(searchParams.get("days")) : 7;
  const format = searchParams.get("format") === "json" ? "json" : "pdf";

  try {
    const [result, { siteName }] = await Promise.all([getInsights(days), getSettings()]);
    if (!result.ok) return NextResponse.json({ error: result.problem }, { status: 502 });

    const now = new Date();
    const file = `insights-${days}d-${now.toISOString().slice(0, 10)}.${format}`;
    const headers = { "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "no-store" };

    if (format === "json") {
      return new Response(JSON.stringify(buildInsightsJson(result.data, siteName, now), null, 2), {
        headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
      });
    }
    const pdf = await buildInsightsPdf(result.data, siteName, now);
    return new Response(new Uint8Array(pdf), { headers: { ...headers, "Content-Type": "application/pdf" } });
  } catch (err) {
    return errorResponse(err);
  }
}
