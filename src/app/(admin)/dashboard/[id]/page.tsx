import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { MemeForm } from "@/components/dashboard/MemeForm";
import { listCategoryNames } from "@/lib/categories";
import { getMemeById, listTags } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export default async function EditMemePage({ params }: Props) {
  const { id } = await params;
  const meme = await getMemeById(id);
  if (!meme) notFound();

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Edit meme" }, { label: meme.title.slice(0, 40) }]} />
      <h1 className="text-2xl font-bold text-zinc-900">Edit meme</h1>
      <MemeForm meme={meme} categories={await listCategoryNames()} tagSuggestions={(await listTags(60)).map((t) => t.tag)} />
    </div>
  );
}
