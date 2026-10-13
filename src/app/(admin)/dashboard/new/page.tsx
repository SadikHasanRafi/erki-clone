import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { MemeForm } from "@/components/dashboard/MemeForm";
import { listCategoryNames } from "@/lib/categories";
import { listTags } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function NewMemePage() {
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "New meme" }]} />
      <h1 className="text-2xl font-bold text-zinc-900">Upload a new meme</h1>
      <MemeForm categories={await listCategoryNames()} tagSuggestions={(await listTags(60)).map((t) => t.tag)} />
    </div>
  );
}
