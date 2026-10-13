import { notFound } from "next/navigation";
import { MemeForm } from "@/components/dashboard/MemeForm";
import { getMemeById } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export default async function EditMemePage({ params }: Props) {
  const { id } = await params;
  const meme = await getMemeById(id);
  if (!meme) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Edit meme</h1>
      <MemeForm meme={meme} />
    </div>
  );
}
