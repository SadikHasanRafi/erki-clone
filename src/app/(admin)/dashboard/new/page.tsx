import { MemeForm } from "@/components/dashboard/MemeForm";

export default function NewMemePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Upload a new meme</h1>
      <MemeForm />
    </div>
  );
}
