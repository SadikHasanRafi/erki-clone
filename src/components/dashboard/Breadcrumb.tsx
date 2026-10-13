import Link from "next/link";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
      <Link href="/dashboard" className="hover:text-brand hover:underline">Dashboard</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span aria-hidden>›</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-brand hover:underline">{item.label}</Link>
          ) : (
            <span className="font-medium text-zinc-800" aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
