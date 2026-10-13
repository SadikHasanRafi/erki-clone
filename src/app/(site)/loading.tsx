import { TopBar } from "@/components/Loader";

export default function SiteLoading() {
  return (
    <>
      <TopBar />
      <div className="grid animate-pulse gap-6 px-4 lg:grid-cols-[240px_minmax(0,1fr)_300px]" aria-busy>
        <div className="hidden space-y-4 lg:block">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 bg-zinc-100" />
          ))}
        </div>
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-80 bg-zinc-100" />
          ))}
        </div>
        <div className="hidden space-y-4 lg:block">
          <div className="h-40 bg-zinc-100" />
          <div className="h-32 bg-zinc-100" />
        </div>
      </div>
    </>
  );
}
