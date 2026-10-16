import { Suspense } from "react";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { RangeTabs } from "@/components/dashboard/RangeTabs";
import { RANGES, getInsights, type Row } from "@/lib/insights";

export const dynamic = "force-dynamic";

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: daysParam } = await searchParams;
  const days = RANGES.includes(Number(daysParam)) ? Number(daysParam) : 7;
  const download = "rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-700 ring-1 ring-black/10 hover:bg-zinc-50";

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Insights" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand">Site insights</h1>
          <p className="text-sm text-zinc-500">Visitors and page views on the live site.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RangeTabs ranges={RANGES} active={days} />
          <a href={`/api/admin/insights/export?days=${days}&format=pdf`} download className={download}>
            Download PDF
          </a>
          <a href={`/api/admin/insights/export?days=${days}&format=json`} download className={download}>
            Download JSON
          </a>
        </div>
      </div>

      {/* Keyed by range, so picking another range shows the skeleton straight away. */}
      <Suspense key={days} fallback={<ReportSkeleton />}>
        <ReportLoader days={days} />
      </Suspense>
    </div>
  );
}

async function ReportLoader({ days }: { days: number }) {
  const result = await getInsights(days);
  if (!result.ok) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
        <p className="font-semibold text-accent">{result.problem}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {result.fix.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    );
  }
  return <Report data={result.data} />;
}

function ReportSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy aria-label="Loading report">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-zinc-200/70" />
        ))}
      </div>
      <div className="h-60 rounded-xl bg-zinc-200/70" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-xl bg-zinc-200/70" />
        ))}
      </div>
    </div>
  );
}

function Report({ data }: { data: Extract<Awaited<ReturnType<typeof getInsights>>, { ok: true }>["data"] }) {
  const periodViews = data.daily.reduce((s, d) => s + d.pageviews, 0);
  const periodVisitors = data.daily.reduce((s, d) => s + d.visitors, 0);
  const peak = Math.max(1, ...data.daily.map((d) => d.pageviews));
  const stats = [
    { label: `Page views (${data.coveredDays}d)`, value: periodViews },
    { label: `Daily visitors added up (${data.coveredDays}d)`, value: periodVisitors },
    { label: "Page views (all time)", value: data.lifetime?.pageviews ?? 0 },
    { label: "Visitors (all time)", value: data.lifetime?.visitors ?? 0 },
    { label: "Today", value: data.daily.at(-1)?.pageviews ?? 0 },
  ];

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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="text-2xl font-bold text-brand">{s.value.toLocaleString("en-US")}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 font-bold text-brand">Page views per day</h2>
        {periodViews === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No traffic recorded in this period yet. Data only appears for the deployed production site, a few minutes after visits.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-1" role="img" aria-label="Daily page views bar chart">
            {data.daily.map((d) => (
              <div key={d.date} className="group relative flex h-full flex-1 items-end">
                <div
                  className={`w-full rounded-t transition-all group-hover:bg-accent ${d.known ? "bg-brand/80" : "bg-zinc-200"}`}
                  style={{ height: `${Math.max(2, (d.pageviews / peak) * 100)}%` }}
                />
                <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-xs text-white group-hover:block">
                  {d.date}: {d.pageviews} views, {d.visitors} visitors
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

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
