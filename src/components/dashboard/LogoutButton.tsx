"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/dashboard/login");
    router.refresh();
  }

  return (
    <button onClick={logout} className="rounded px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white">
      Log out
    </button>
  );
}
