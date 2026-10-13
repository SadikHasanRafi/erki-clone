import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ThumbStrip } from "@/components/site/ThumbStrip";
import { LAYOUT } from "@/lib/config";
import { listCategories } from "@/lib/categories";
import { listMemes } from "@/lib/store";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  // A database hiccup should not take the header and footer down with it.
  const [strip, categories] = await Promise.all([
    listMemes({ limit: LAYOUT.stripCount }).catch(() => []),
    listCategories().catch(() => []),
  ]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1312px]">
        <Suspense fallback={<div className="h-[52px] bg-sun" />}>
          <SiteHeader categories={categories.map((c) => c.name)} />
        </Suspense>
        <ThumbStrip memes={strip} />
        <div className="min-h-[60vh]">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}
