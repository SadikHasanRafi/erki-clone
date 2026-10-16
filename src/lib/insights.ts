// Reads Web Analytics data from Vercel's REST API. Server-only: the access token must never reach the browser.
// Docs: https://vercel.com/docs/analytics/web-analytics-api

import { analyticsDailyCollection } from "./db";

const API = "https://api.vercel.com/v1/query/web-analytics";

// Longest range the dashboard offers. Vercel only serves 31 days on the free plan, so anything
// older comes from the daily totals this dashboard saves in MongoDB (see saveDaily).
export const RANGES = [7, 30, 90, 180, 365];
// Vercel refuses day-by-day queries longer than this on any plan.
const MAX_DAILY_QUERY = 62;

export type Row = { label: string; pageviews: number; visitors: number };
// known=false marks a day with no data from Vercel or the saved history (not the same as zero visits).
export type DayPoint = { date: string; pageviews: number; visitors: number; known: boolean };

export type Insights = {
  days: number; // range asked for
  coveredDays: number; // days actually shown, counted from the oldest day with data
  liveDays: number; // days Vercel itself provided on this request
  savedDays: number; // days filled in from the saved history
  breakdownDays: number; // period the lists below cover (limited by Vercel)
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

const dayOffset = (days: number) => isoDay(new Date(Date.now() - days * 86_400_000));

// Asks for the daily series; if the plan only allows a shorter window, retries with the limit Vercel names.
async function fetchDaily(days: number, c: Config): Promise<{ rows: AggregateRow[]; liveDays: number }> {
  let n = Math.min(days, MAX_DAILY_QUERY);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return { rows: await aggregate("day", n, n + 1, c), liveDays: n };
    } catch (err) {
      const allowed = err instanceof ApiError && err.status === 400 ? Number(/latest (\d+) days/.exec(err.message)?.[1]) : NaN;
      if (allowed > 0 && allowed < n) {
        n = allowed;
        continue;
      }
      throw err;
    }
  }
  throw new ApiError("Could not find a date range Vercel accepts.", 400);
}

async function saveDaily(points: { date: string; pageviews: number; visitors: number }[]): Promise<void> {
  if (points.length === 0) return;
  await (await analyticsDailyCollection()).bulkWrite(
    points.map((p) => ({
      updateOne: {
        filter: { _id: p.date },
        update: { $set: { pageviews: p.pageviews, visitors: p.visitors } },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}

async function loadSaved(since: string): Promise<Map<string, { pageviews: number; visitors: number }>> {
  const docs = await (await analyticsDailyCollection()).find({ _id: { $gte: since } }).toArray();
  return new Map(docs.map((d) => [d._id, { pageviews: d.pageviews, visitors: d.visitors }]));
}

// Copies the latest daily totals Vercel will give us into MongoDB. Run daily by the cron route and on every Insights view.
export async function snapshotAnalytics(): Promise<{ saved: number }> {
  const cfg = readConfig();
  if ("missing" in cfg) throw new Error(`Missing ${cfg.missing.join(", ")}`);
  const { rows } = await fetchDaily(MAX_DAILY_QUERY, cfg.config);
  const points = rows
    .map((r) => ({ date: String(r.timestamp ?? "").slice(0, 10), pageviews: Number(r.pageviews ?? 0), visitors: Number(r.visitors ?? 0) }))
    .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.date));
  await saveDaily(points);
  return { saved: points.length };
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

  // The daily series goes first: it tells us how far back Vercel lets this plan look.
  let live: { rows: AggregateRow[]; liveDays: number };
  try {
    live = await fetchDaily(days, c);
  } catch (err) {
    errors.push(`Daily traffic: ${explain(err).problem}`);
    live = { rows: [], liveDays: Math.min(days, 31) };
  }
  const { liveDays } = live;

  const [pages, countries, referrers, devices, browsers, saved] = await Promise.all([
    settle("Top pages", aggregate("route", liveDays, 10, c), []),
    settle("Countries", aggregate("country", liveDays, 10, c), []),
    settle("Referrers", aggregate("referrerHostname", liveDays, 10, c), []),
    settle("Devices", aggregate("deviceType", liveDays, 5, c), []),
    settle("Browsers", aggregate("browserName", liveDays, 8, c), []),
    loadSaved(dayOffset(days - 1)).catch(() => new Map<string, { pageviews: number; visitors: number }>()),
  ]);

  const liveByDate = new Map(live.rows.map((r) => [String(r.timestamp ?? "").slice(0, 10), r]));
  const liveStart = dayOffset(liveDays - 1);

  // Fresh numbers from Vercel win; older days come from the saved history.
  const full: DayPoint[] = Array.from({ length: days }, (_, i) => {
    const date = dayOffset(days - 1 - i);
    if (date >= liveStart && live.rows.length > 0) {
      const r = liveByDate.get(date);
      return { date, pageviews: Number(r?.pageviews ?? 0), visitors: Number(r?.visitors ?? 0), known: true };
    }
    const s = saved.get(date);
    return s ? { date, ...s, known: true } : { date, pageviews: 0, visitors: 0, known: false };
  });

  // Keep the history growing; a failure here must never break the page.
  await saveDaily(full.filter((d) => d.known && d.date >= liveStart && live.rows.length > 0)).catch(() => undefined);

  // Start the chart at the oldest day we actually have data for.
  const firstKnown = Math.max(0, full.findIndex((d) => d.known));
  const daily = full.slice(firstKnown);
  const savedDays = daily.filter((d) => d.known && d.date < liveStart).length;

  return {
    ok: true,
    data: {
      days,
      coveredDays: daily.length,
      liveDays,
      savedDays,
      breakdownDays: liveDays,
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
