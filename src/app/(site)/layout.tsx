import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ThumbStrip } from "@/components/site/ThumbStrip";
import { LAYOUT } from "@/lib/config";
import { listMemes } from "@/lib/store";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  // A database hiccup should not take the header and footer down with it.
  const strip = await listMemes({ limit: LAYOUT.stripCount }).catch(() => []);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1312px]">
        <Suspense fallback={<div className="h-[52px] bg-sun" />}>
          <SiteHeader />
        </Suspense>
        <ThumbStrip memes={strip} />
        <div className="min-h-[60vh]">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}
