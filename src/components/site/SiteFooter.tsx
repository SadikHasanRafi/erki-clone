import { SITE_NAME } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-zinc-900 text-zinc-300">
      <div className="py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
