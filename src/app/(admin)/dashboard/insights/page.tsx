import Link from "next/link";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { RANGES, getInsights, type DayPoint, type Row } from "@/lib/insights";

export const dynamic = "force-dynamic";

const rangeLabel = (d: number) => (d === 365 ? "1 year" : d === 180 ? "6 months" : d === 90 ? "3 months" : `${d} days`);

// Long ranges are shown a week per bar so a year stays readable.
type Bar = { key: string; label: string; pageviews: number; visitors: number | null; known: boolean };
function toBars(daily: DayPoint[]): Bar[] {
  if (daily.length <= 62) {
    return daily.map((d) => ({ key: d.date, label: d.date, pageviews: d.pageviews, visitors: d.visitors, known: d.known }));
  }
  const bars: Bar[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const week = daily.slice(i, i + 7);
    const known = week.some((d) => d.known);
    bars.push({
      key: week[0].date,
      label: `${week[0].date} → ${week.at(-1)!.date}`,
      pageviews: week.reduce((sum, d) => sum + d.pageviews, 0),
      visitors: null,
      known,
    });
  }
  return bars;
}

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: daysParam } = await searchParams;
  const days = RANGES.includes(Number(daysParam)) ? Number(daysParam) : 30;
  const result = await getInsights(days);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Insights" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand">Site insights</h1>
          <p className="text-sm text-zinc-500">Live from Vercel Web Analytics. Production traffic only.</p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg bg-white p-1 ring-1 ring-black/10">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/dashboard/insights?days=${r}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${days === r ? "bg-brand text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              {rangeLabel(r)}
            </Link>
          ))}
        </div>
      </div>

      {!result.ok ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
          <p className="font-semibold text-accent">{result.problem}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {result.fix.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      ) : (
        <Report data={result.data} />
      )}

      <SpeedInsightsNote />
    </div>
  );
}

function Report({ data }: { data: Extract<Awaited<ReturnType<typeof getInsights>>, { ok: true }>["data"] }) {
  const periodViews = data.daily.reduce((s, d) => s + d.pageviews, 0);
  const periodVisitors = data.daily.reduce((s, d) => s + d.visitors, 0);
  const bars = toBars(data.daily);
  const peak = Math.max(1, ...bars.map((b) => b.pageviews));
  const limited = data.coveredDays < data.days;
  const stats = [
    { label: `Page views (${data.coveredDays}d)`, value: periodViews },
    { label: `Daily visitors added up (${data.coveredDays}d)`, value: periodVisitors },
    { label: "Page views (all time)", value: data.lifetime?.pageviews ?? 0 },
    { label: "Visitors (all time)", value: data.lifetime?.visitors ?? 0 },
    { label: "Today", value: data.daily.at(-1)?.pageviews ?? 0 },
  ];
  const earliest = data.daily[0]?.date;

  return (
    <>
      {data.errors.length > 0 && (
        <div className="rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent">
          <p className="font-semibold">Some sections could not load:</p>
          <ul className="list-disc pl-5">
            {data.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {limited && (
        <div className="rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
          <p>
            Showing <strong>{data.coveredDays} days</strong> of data{earliest ? ` (since ${earliest})` : ""}, not the full {rangeLabel(data.days)}.
            Vercel&apos;s free plan only provides the latest {data.liveDays} days.
            {data.savedDays > 0 ? ` ${data.savedDays} older days come from totals saved by this dashboard.` : ""} This dashboard now saves each day&apos;s totals
            automatically, so this history keeps growing, up to a year. Upgrading the Vercel plan makes more history available.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="text-2xl font-bold text-brand">{s.value.toLocaleString("en-US")}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 font-bold text-brand">Page views per {bars.length < data.daily.length ? "week" : "day"}</h2>
        {periodViews === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No traffic recorded in this period yet. Data only appears for the deployed production site, a few minutes after visits.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-1" role="img" aria-label="Daily page views bar chart">
            {bars.map((b) => (
              <div key={b.key} className="group relative flex h-full flex-1 items-end">
                <div
                  className={`w-full rounded-t transition-all group-hover:bg-accent ${b.known ? "bg-brand/80" : "bg-zinc-200"}`}
                  style={{ height: `${Math.max(2, (b.pageviews / peak) * 100)}%` }}
                />
                <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-xs text-white group-hover:block">
                  {b.known ? `${b.label}: ${b.pageviews} views${b.visitors === null ? "" : `, ${b.visitors} visitors`}` : `${b.label}: no data saved`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {data.breakdownDays < data.coveredDays && (
        <p className="text-xs text-zinc-500">The lists below cover the latest {data.breakdownDays} days, the most Vercel provides on this plan.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <List title="Top pages" rows={data.topPages} />
        <List title="Referrers" rows={data.referrers} />
        <List title="Countries" rows={data.countries} />
        <List title="Devices" rows={data.devices} />
        <List title="Browsers" rows={data.browsers} />
      </div>
    </>
  );
}

function List({ title, rows }: { title: string; rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.pageviews));
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-3 font-bold text-brand">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate text-zinc-700">{r.label}</span>
                <span className="shrink-0 tabular-nums text-zinc-500">{r.pageviews.toLocaleString("en-US")}</span>
              </div>
              <div className="mt-1 h-1.5 rounded bg-zinc-100">
                <div className="h-full rounded bg-brand/70" style={{ width: `${(r.pageviews / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SpeedInsightsNote() {
  return (
    <section className="rounded-xl bg-white p-5 text-sm shadow-sm ring-1 ring-black/5">
      <h2 className="mb-1 font-bold text-brand">Speed Insights (Core Web Vitals)</h2>
      <p className="text-zinc-600">
        Collection is on, but Vercel has no read API for Speed Insights, so those charts can only be viewed in the Vercel dashboard: Project &rarr; Speed
        Insights tab.
      </p>
    </section>
  );
}
