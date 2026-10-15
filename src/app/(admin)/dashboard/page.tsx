import { MemeTable } from "@/components/dashboard/MemeTable";
import { countUnreadMessages } from "@/lib/messages";
import { getSiteVisits } from "@/lib/stats";
import { listMemes } from "@/lib/store";

export default async function DashboardPage() {
  const [memes, visits, unread] = await Promise.all([
    listMemes({ includeDrafts: true }),
    getSiteVisits().catch(() => 0),
    countUnreadMessages().catch(() => 0),
  ]);
  const stats = [
    { label: "Total memes", value: memes.length },
    { label: "Published", value: memes.filter((m) => m.status === "published").length },
    { label: "Drafts", value: memes.filter((m) => m.status === "draft").length },
    { label: "Post views", value: memes.reduce((sum, m) => sum + m.views, 0) },
    { label: "Site visits", value: visits },
    { label: "Unread messages", value: unread },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="text-2xl font-bold text-brand">{s.value.toLocaleString("en-US")}</p>
          </div>
        ))}
      </div>
      <MemeTable memes={memes} />
    </div>
  );
}
