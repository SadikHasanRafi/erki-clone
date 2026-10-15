import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { HomepageEditor } from "@/components/dashboard/HomepageEditor";
import { getSettings } from "@/lib/settings";
import { listMemes } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomepageLayoutPage() {
  const [{ home, placements, layout }, memes] = await Promise.all([getSettings(), listMemes({ limit: 500 })]);
  const posts = memes.map((m) => ({ id: m.id, title: m.title, category: m.category }));
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Homepage" }]} />
      <h1 className="text-2xl font-bold text-zinc-900">Homepage layout</h1>
      <HomepageEditor initial={{ home, placements, layout }} posts={posts} />
    </div>
  );
}
