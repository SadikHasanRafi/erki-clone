import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { PagesEditor } from "@/components/dashboard/PagesEditor";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const { about, contact } = await getSettings();
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Pages" }]} />
      <h1 className="text-2xl font-bold text-zinc-900">About & Contact pages</h1>
      <PagesEditor initial={{ about, contact }} />
    </div>
  );
}
