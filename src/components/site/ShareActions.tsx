"use client";

import { useState } from "react";
import { useLabels } from "./SettingsProvider";
import { Icon } from "./Icon";

type Props = { url: string; title: string; imageUrl: string; variant: "rail" | "inline" | "bar" };

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm0 16.4a7.4 7.4 0 0 1-3.8-1l-.3-.2-2.7.7.7-2.6-.2-.3A7.4 7.4 0 1 1 12 19.4Zm4.1-5.5c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6 6 0 0 1-3-2.6c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4a.8.8 0 0 0-.6.3 2.4 2.4 0 0 0-.8 1.8 4.3 4.3 0 0 0 .9 2.2 9.6 9.6 0 0 0 3.7 3.2c1.4.6 1.9.6 2.6.5.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.2-.1Z" />
    </svg>
  );
}

// Facebook, WhatsApp, copy link and image download, laid out for the desktop side rail,
// the author strip, or the fixed bottom bar on phones.
export function ShareActions({ url, title, imageUrl, variant }: Props) {
  const L = useLabels();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(L.copyLink, url);
    }
  }

  // Phones get the system share sheet when the browser has one; otherwise the link is copied.
  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissing the sheet is not an error worth surfacing.
      }
      return;
    }
    await copy();
  }

  const actions = [
    { key: "fb", label: "Facebook", glyph: <FacebookGlyph />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { key: "wa", label: "WhatsApp", glyph: <WhatsAppGlyph />, href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];

  const round =
    variant === "bar"
      ? "grid h-10 w-10 place-items-center rounded-full border border-hairline bg-white text-ink-2 active:scale-95"
      : "grid h-9 w-9 place-items-center rounded-full border border-hairline bg-canvas text-neutral-600 transition-colors hover:bg-subtle hover:text-ink";

  const buttons = (
    <>
      {actions.map((a) => (
        <a key={a.key} href={a.href} target="_blank" rel="noopener noreferrer" aria-label={`${L.share}: ${a.label}`} title={a.label} className={round}>
          {a.glyph}
        </a>
      ))}
      <button type="button" onClick={copy} aria-label={L.copyLink} title={copied ? L.copied : L.copyLink} className={round}>
        <Icon name="link" className="h-4 w-4" />
      </button>
      <a href={imageUrl} download aria-label={L.download} title={L.download} className={round}>
        <Icon name="download" className="h-4 w-4" />
      </a>
    </>
  );

  if (variant === "rail") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-full border border-hairline bg-white px-2 py-4 shadow-sm">
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{L.share}</span>
        {buttons}
        <span className={`min-h-3 font-display text-[9px] font-semibold uppercase text-amber-deep ${copied ? "" : "invisible"}`} aria-live="polite">
          {L.copied}
        </span>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-canvas/90 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-2">{buttons}</div>
          <button
            type="button"
            onClick={shareNative}
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-white shadow-sm"
            aria-live="polite"
          >
            <Icon name="share" className="h-4 w-4 text-amber" />
            {copied ? L.copied : L.share}
          </button>
        </div>
      </div>
    );
  }

  return <div className="flex flex-wrap items-center gap-2">{buttons}</div>;
}
