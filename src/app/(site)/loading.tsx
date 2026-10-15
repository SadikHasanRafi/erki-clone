import { TopBar } from "@/components/Loader";

export default function SiteLoading() {
  return (
    <>
      <TopBar />
      <div className="mx-auto grid w-full max-w-7xl animate-pulse grid-cols-1 gap-8 px-5 py-8 md:px-10 lg:grid-cols-12 lg:px-8" aria-busy>
        <div className="h-[420px] rounded-2xl bg-subtle lg:col-span-8" />
        <div className="hidden flex-col gap-4 lg:col-span-4 lg:flex">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-subtle" />
          ))}
        </div>
        <div className="h-40 rounded-2xl bg-subtle lg:col-span-12" />
      </div>
    </>
  );
}
