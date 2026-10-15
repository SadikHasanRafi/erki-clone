import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { SettingsEditor } from "@/components/dashboard/SettingsEditor";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Settings" }]} />
      <h1 className="text-2xl font-bold text-zinc-900">Site settings</h1>
      <SettingsEditor initial={await getSettings()} />
    </div>
  );
}
