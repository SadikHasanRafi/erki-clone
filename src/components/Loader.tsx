export function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-brand ${className}`} fill="none" viewBox="0 0 24 24" role="status" aria-label="Loading">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// Thin bar pinned to the top of the page, shown while a route is loading.
export function TopBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-transparent" aria-hidden>
      <div className="h-full w-1/3 animate-[topbar_1s_ease-in-out_infinite] bg-brand" />
    </div>
  );
}

// Placeholder for the home page and for desk, tag and search results while the next page streams in.
export function FeedSkeleton({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-5 py-6 md:px-10 md:py-8 lg:px-8" aria-busy aria-label="Loading">
      {filtered ? (
        <>
          <div className="mb-4 h-3 w-40 rounded bg-subtle" />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col gap-5 lg:col-span-8">
              <div className="h-5 w-48 rounded bg-subtle" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-64 rounded-xl bg-subtle" />
                ))}
              </div>
            </div>
            <div className="hidden flex-col gap-6 lg:col-span-4 lg:flex">
              <div className="h-72 rounded-2xl bg-subtle" />
              <div className="h-40 rounded-2xl bg-subtle" />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="h-[420px] rounded-2xl bg-subtle lg:col-span-8" />
          <div className="hidden flex-col gap-4 lg:col-span-4 lg:flex">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-subtle" />
            ))}
          </div>
          <div className="h-40 rounded-2xl bg-subtle lg:col-span-12" />
        </div>
      )}
    </div>
  );
}
