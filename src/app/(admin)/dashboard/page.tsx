import { MemeTable } from "@/components/dashboard/MemeTable";
import { listMemes } from "@/lib/store";

export default async function DashboardPage() {
  const memes = await listMemes({ includeDrafts: true });
  const stats = [
    { label: "Total memes", value: memes.length },
    { label: "Published", value: memes.filter((m) => m.status === "published").length },
    { label: "Drafts", value: memes.filter((m) => m.status === "draft").length },
    { label: "Total views", value: memes.reduce((sum, m) => sum + m.views, 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
