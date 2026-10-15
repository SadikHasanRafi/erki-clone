"use client";

import Link from "next/link";
import { useState } from "react";
import type { SiteSettings } from "@/lib/site-settings";
import { Card, ImageField, SaveBar, TextArea, TextField, Toggle, useSettingsSaver } from "./fields";

const FORMAT_HINT = "Leave a blank line between paragraphs. Start a line with “## ” for a heading, or “- ” for a bullet point.";

export function PagesEditor({ initial }: { initial: Pick<SiteSettings, "about" | "contact"> }) {
  const [about, setAbout] = useState(initial.about);
  const [contact, setContact] = useState(initial.contact);
  const { save, busy, message, error } = useSettingsSaver();

  async function onSave() {
    const saved = await save({ about, contact });
    if (saved) {
      setAbout(saved.about);
      setContact(saved.contact);
    }
  }

  return (
    <div className="space-y-5">
      <Card title="About Us page" description="Shown at /about.">
        <div className="flex justify-end">
          <Link href="/about" target="_blank" className="text-sm text-brand hover:underline">Open page ↗</Link>
        </div>
        <TextField label="Title" value={about.title} onChange={(v) => setAbout({ ...about, title: v })} maxLength={120} />
        <TextArea label="Intro" value={about.intro} onChange={(v) => setAbout({ ...about, intro: v })} rows={2} maxLength={600} hint="Large lead text under the title." />
        <ImageField label="Image (optional)" value={about.imageUrl} onChange={(v) => setAbout({ ...about, imageUrl: v })} />
        <TextArea label="Page text" value={about.body} onChange={(v) => setAbout({ ...about, body: v })} rows={14} maxLength={20000} hint={FORMAT_HINT} />
      </Card>

      <Card title="Contact Us page" description="Shown at /contact. Email, phone and address come from Settings → Branding & contact.">
        <div className="flex justify-end">
          <Link href="/contact" target="_blank" className="text-sm text-brand hover:underline">Open page ↗</Link>
        </div>
        <TextField label="Title" value={contact.title} onChange={(v) => setContact({ ...contact, title: v })} maxLength={120} />
        <TextArea label="Intro" value={contact.intro} onChange={(v) => setContact({ ...contact, intro: v })} rows={4} maxLength={1000} hint={FORMAT_HINT} />
        <Toggle label="Show the contact form" hint="Messages arrive in the dashboard inbox." checked={contact.showForm} onChange={(v) => setContact({ ...contact, showForm: v })} />
        <TextField label="Message after sending" value={contact.successMessage} onChange={(v) => setContact({ ...contact, successMessage: v })} maxLength={300} />
      </Card>

      <SaveBar busy={busy} message={message} error={error} onSave={onSave} />
    </div>
  );
}
