import type { ReactNode } from "react";
import { Suspense } from "react";
import { SettingsProvider } from "@/components/site/SettingsProvider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { listCategories } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import { getMemesByIds, listMemes } from "@/lib/store";
import { fillSlots } from "@/lib/placements";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  const count = settings.layout.tickerCount;
  // A database hiccup should not take the header and footer down with it.
  const [pinned, latest, categories] = await Promise.all([
    getMemesByIds(settings.placements.wire).catch(() => []),
    listMemes({ limit: count + settings.placements.wire.length }).catch(() => []),
    listCategories().catch(() => []),
  ]);
  const names = categories.map((c) => c.name);
  const headlines = fillSlots(pinned, latest, count).map((m) => ({ title: m.title, slug: m.slug }));

  return (
    <SettingsProvider value={settings}>
      {/* Bottom padding on phones keeps content clear of the fixed bottom bar. */}
      <div id="top" className="flex min-h-screen flex-col bg-canvas pb-16 text-ink md:pb-0">
        <Suspense fallback={<div className="h-[105px] border-b border-hairline bg-canvas md:h-[133px]" />}>
          <SiteHeader categories={names} headlines={headlines} />
        </Suspense>
        <div className="w-full flex-1">{children}</div>
        <SiteFooter categories={names} />
      </div>
    </SettingsProvider>
  );
}
