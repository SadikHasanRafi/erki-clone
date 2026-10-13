import { Spinner, TopBar } from "@/components/Loader";

export default function DashboardLoading() {
  return (
    <>
      <TopBar />
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500">
        <Spinner />
        Loading…
      </div>
    </>
  );
}
