import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-zinc-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="text-lg font-bold">
            Meme CRM
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <DashboardNav />
            <Link href="/" target="_blank" className="rounded px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white">
              View site ↗
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
