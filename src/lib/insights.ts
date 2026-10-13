// Reads Web Analytics data from Vercel's REST API. Server-only: the access token must never reach the browser.
// Docs: https://vercel.com/docs/analytics/web-analytics-api

const API = "https://api.vercel.com/v1/query/web-analytics";

export type Row = { label: string; pageviews: number; visitors: number };
export type DayPoint = { date: string; pageviews: number; visitors: number };

export type Insights = {
  days: number;
  lifetime: { pageviews: number; visitors: number } | null;
  daily: DayPoint[];
  topPages: Row[];
  countries: Row[];
  referrers: Row[];
  devices: Row[];
  browsers: Row[];
  errors: string[];
};

export type InsightsResult =
  | { ok: true; data: Insights }
  | { ok: false; problem: string; fix: string[] };

type Config = { token: string; projectId: string; teamId?: string };

function readConfig(): { config: Config } | { missing: string[] } {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const missing = [!token && "VERCEL_API_TOKEN", !projectId && "VERCEL_PROJECT_ID"].filter(Boolean) as string[];
  if (missing.length || !token || !projectId) return { missing };
  return { config: { token, projectId, teamId: process.env.VERCEL_TEAM_ID || undefined } };
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function query(path: string, params: Record<string, string>, c: Config): Promise<unknown> {
  const url = new URL(`${API}/${path}`);
  url.searchParams.set("projectId", c.projectId);
  if (c.teamId) url.searchParams.set("teamId", c.teamId);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${c.token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new ApiError(body?.error?.message ?? res.statusText, res.status);
  }
  return res.json();
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

type AggregateRow = Record<string, unknown> & { pageviews?: number; visitors?: number; timestamp?: string };

async function aggregate(by: string, days: number, limit: number, c: Config): Promise<AggregateRow[]> {
  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 86_400_000);
  const json = (await query(
    "visits/aggregate",
    { by, since: isoDay(since), until: isoDay(until), limit: String(limit) },
    c,
  )) as { data?: AggregateRow[] };
  return json.data ?? [];
}

const toRows = (rows: AggregateRow[], key: string): Row[] =>
  rows
    .map((r) => ({
      label: String(r[key] ?? "Unknown") || "Unknown",
      pageviews: Number(r.pageviews ?? 0),
      visitors: Number(r.visitors ?? 0),
    }))
    .sort((a, b) => b.pageviews - a.pageviews);

function explain(err: unknown): { problem: string; fix: string[] } {
  if (err instanceof ApiError) {
    if (err.status === 401)
      return {
        problem: "Vercel rejected your access token (401).",
        fix: ["Create a new token at vercel.com/account/tokens.", "Put it in .env as VERCEL_API_TOKEN and restart the dev server."],
      };
    if (err.status === 403)
      return {
        problem: "Vercel refused access (403): the token is invalid, expired, or not allowed to read this project.",
        fix: [
          "Create a fresh token at vercel.com/account/tokens under the account or team that owns the project, with that scope selected.",
          "If the project belongs to a team, set VERCEL_TEAM_ID.",
          `Vercel said: ${err.message}`,
        ],
      };
    if (err.status === 404 || err.status === 400)
      return {
        problem: `Vercel could not find the project or Web Analytics data (${err.status}).`,
        fix: [
          "Check VERCEL_PROJECT_ID (starts with prj_) in Project Settings > General.",
          "Turn on Web Analytics: Project > Analytics tab > Enable, then redeploy.",
          `Vercel said: ${err.message}`,
        ],
      };
    if (err.status === 429)
      return { problem: "Vercel rate limit hit.", fix: ["Wait a minute and refresh."] };
    return { problem: `Vercel API error (${err.status}): ${err.message}`, fix: ["Try again shortly."] };
  }
  if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError"))
    return { problem: "Vercel's API took too long to respond.", fix: ["Refresh in a moment."] };
  return {
    problem: "Could not reach Vercel's API.",
    fix: ["Check your internet connection.", err instanceof Error ? err.message : String(err)],
  };
}

export async function getInsights(days: number): Promise<InsightsResult> {
  const cfg = readConfig();
  if ("missing" in cfg) {
    return {
      ok: false,
      problem: `Not configured yet: ${cfg.missing.join(" and ")} ${cfg.missing.length > 1 ? "are" : "is"} missing from .env.`,
      fix: [
        "Create an access token at vercel.com/account/tokens and set VERCEL_API_TOKEN.",
        "Copy the project ID (Project Settings > General) and set VERCEL_PROJECT_ID.",
        "If the project is in a team, also set VERCEL_TEAM_ID (Team Settings > General).",
        "Restart the dev server.",
      ],
    };
  }
  const c = cfg.config;

  // The first call doubles as a credentials check, so a bad token gives one clear message instead of seven.
  let lifetime: Insights["lifetime"] = null;
  try {
    const json = (await query("visits/count", {}, c)) as { data?: { pageviews?: number; visitors?: number } };
    lifetime = { pageviews: Number(json.data?.pageviews ?? 0), visitors: Number(json.data?.visitors ?? 0) };
  } catch (err) {
    return { ok: false, ...explain(err) };
  }

  const errors: string[] = [];
  const settle = async <T,>(label: string, p: Promise<T>, fallback: T): Promise<T> => {
    try {
      return await p;
    } catch (err) {
      errors.push(`${label}: ${explain(err).problem}`);
      return fallback;
    }
  };

  const [dailyRaw, pages, countries, referrers, devices, browsers] = await Promise.all([
    settle("Daily traffic", aggregate("day", days, days + 1, c), []),
    settle("Top pages", aggregate("route", days, 10, c), []),
    settle("Countries", aggregate("country", days, 10, c), []),
    settle("Referrers", aggregate("referrerHostname", days, 10, c), []),
    settle("Devices", aggregate("deviceType", days, 5, c), []),
    settle("Browsers", aggregate("browserName", days, 8, c), []),
  ]);

  const byDate = new Map(dailyRaw.map((r) => [String(r.timestamp ?? "").slice(0, 10), r]));
  const daily: DayPoint[] = Array.from({ length: days }, (_, i) => {
    const date = isoDay(new Date(Date.now() - (days - 1 - i) * 86_400_000));
    const r = byDate.get(date);
    return { date, pageviews: Number(r?.pageviews ?? 0), visitors: Number(r?.visitors ?? 0) };
  });

  return {
    ok: true,
    data: {
      days,
      lifetime,
      daily,
      topPages: toRows(pages, "route"),
      countries: toRows(countries, "country"),
      referrers: toRows(referrers, "referrerHostname"),
      devices: toRows(devices, "deviceType"),
      browsers: toRows(browsers, "browserName"),
      errors,
    },
  };
}
