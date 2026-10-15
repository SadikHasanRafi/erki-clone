// Plain text written in the dashboard: blank lines split paragraphs, "## " starts a heading,
// and lines starting with "- " become a bullet list.
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`flex flex-col gap-5 text-base leading-relaxed text-neutral-700 md:text-lg ${className}`}>
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) {
          return <h2 key={i} className="pt-2 font-display text-xl font-bold tracking-tight text-ink md:text-2xl">{b.slice(3)}</h2>;
        }
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1.5 pl-6 marker:text-amber">
              {lines.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}
            </ul>
          );
        }
        return <p key={i} className="whitespace-pre-line">{b}</p>;
      })}
    </div>
  );
}
