"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/config";
import type { Meme } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function MemeForm({ meme }: { meme?: Meme }) {
  const router = useRouter();
  const isEdit = Boolean(meme);
  const [preview, setPreview] = useState<string | null>(meme?.imageUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [translating, setTranslating] = useState(false);
  const [title, setTitle] = useState(meme?.title ?? "");
  const [description, setDescription] = useState(meme?.description ?? "");
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageAvailable, setImageAvailable] = useState(true);

  // Show the chosen file locally before upload, and free the object URL when it changes.
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!localPreview) return;
    return () => URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  function onFileChange(file: File | undefined) {
    if (!file) {
      setLocalPreview(null);
      setPreview(meme?.imageUrl ?? null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    setPreview(url);
  }

  async function translateText(text: string, targetLanguage: "en") {
    try {
      setTranslating(true);
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.translatedText;
    } catch {
      setError("Translation failed. Please try again.");
      return null;
    } finally {
      setTranslating(false);
    }
  }

  async function handleTranslateTitle() {
    if (!title) return;
    const translated = await translateText(title, "en");
    if (translated) setTitle(translated);
  }

  async function handleTranslateDescription() {
    if (!description) return;
    const translated = await translateText(description, "en");
    if (translated) setDescription(translated);
  }

  async function handleImageUrlChange(url: string) {
    setImageUrl(url);
    setImageError(null);
    setImageAvailable(true);

    if (!url) {
      setPreview(null);
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      setImageError("Invalid URL format");
      return;
    }

    // Check if image is accessible
    setImageLoading(true);
    try {
      const res = await fetch("/api/validate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        setImageError("Image not found or not accessible");
        setImageAvailable(false);
        return;
      }

      setPreview(url);
      setLocalPreview(null);
    } catch {
      setImageError("Failed to validate image");
      setImageAvailable(false);
    } finally {
      setImageLoading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validate image before submission
    if (imageTab === "url" && !imageUrl) {
      setError("Please provide an image URL");
      return;
    }

    if (imageTab === "url" && imageError) {
      setError(`Image error: ${imageError}`);
      return;
    }

    if (imageTab === "url" && !imageAvailable) {
      setError("The image URL is not accessible. Please check and try again.");
      return;
    }

    setSaving(true);
    try {
      const form = new FormData(e.currentTarget);

      // If using image URL, add it to the form
      if (imageTab === "url" && imageUrl) {
        form.set("imageUrl", imageUrl);
      }

      const res = await fetch(isEdit ? `/api/admin/memes/${meme!.id}` : "/api/admin/memes", {
        method: isEdit ? "PATCH" : "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error ??
            (res.status === 401
              ? "Your session expired. Please log in again."
              : res.status === 413
                ? "The image is too large to upload. Keep it under 5 MB."
                : `The server returned an error (${res.status}). Check the terminal running npm run dev.`),
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your internet connection and that the dev server is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form onSubmit={onSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div>
          <label className="mb-3 block text-sm font-semibold text-zinc-700">Image Source *</label>

          {/* Tabs - Mobile Responsive */}
          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-zinc-200 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setImageTab("upload");
                setImageUrl("");
                setImageError(null);
                setPreview(meme?.imageUrl ?? null);
              }}
              className={`whitespace-nowrap px-3 py-2.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm ${
                imageTab === "upload"
                  ? "border-b-2 border-brand text-brand"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              📤 Upload
            </button>
            <button
              type="button"
              onClick={() => setImageTab("url")}
              className={`whitespace-nowrap px-3 py-2.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm ${
                imageTab === "url"
                  ? "border-b-2 border-brand text-brand"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              🔗 URL
            </button>
          </div>

          {/* Image Preview - With Animation */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 sm:w-48">
              {imageLoading && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200" />
              )}

              {preview && imageAvailable ? (
                <div className="relative w-full h-full transition-opacity duration-300" style={{ opacity: imageLoading ? 0.5 : 1 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-contain"
                    onError={() => {
                      setImageAvailable(false);
                      setImageError("Image failed to load");
                    }}
                  />
                </div>
              ) : imageError ? (
                <div className="text-center px-4 py-8">
                  <span className="text-3xl">⚠️</span>
                  <p className="mt-2 text-xs text-accent font-medium">{imageError}</p>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-3xl">🖼️</span>
                  <p className="mt-2 text-xs text-zinc-400">No preview</p>
                </div>
              )}
            </div>

            {/* Upload/URL Input */}
            <div className="flex-1 space-y-2">
              {imageTab === "upload" ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    required={!isEdit && imageTab === "upload"}
                    onChange={(e) => {
                      setImageError(null);
                      onFileChange(e.target.files?.[0]);
                    }}
                    className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-dark file:transition-colors file:duration-200 cursor-pointer"
                  />
                  <p className="text-xs text-zinc-500">JPG, PNG, WEBP, or GIF (max 5 MB)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className={`${inputClass} pr-10 transition-colors duration-200`}
                      required={imageTab === "url"}
                    />
                    {imageLoading && (
                      <div className="absolute right-3 top-2.5 animate-spin">
                        <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                    {imageUrl && !imageError && !imageLoading && (
                      <div className="absolute right-3 top-2.5 text-green-600 font-bold">✓</div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">Must be publicly accessible (https://...)</p>
                  {imageError && (
                    <p className="text-xs text-accent font-medium">{imageError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          {isEdit && <p className="text-xs text-zinc-500">Leave empty to keep the current image.</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-semibold text-zinc-700" htmlFor="title">
              Title *
            </label>
            <button
              type="button"
              onClick={handleTranslateTitle}
              disabled={translating || !title}
              className="text-xs font-medium text-brand hover:text-brand-dark disabled:text-zinc-400"
            >
              {translating ? "🔄 Translating…" : "🌐 Translate to English"}
            </button>
          </div>
          <input
            id="title"
            name="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. বাসের জানালা দিয়ে… or English title"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-semibold text-zinc-700" htmlFor="description">
              Description
            </label>
            <button
              type="button"
              onClick={handleTranslateDescription}
              disabled={translating || !description}
              className="text-xs font-medium text-brand hover:text-brand-dark disabled:text-zinc-400"
            >
              {translating ? "🔄 Translating…" : "🌐 Translate to English"}
            </button>
          </div>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="One to three sentences: context, where it came from, why it's funny."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700" htmlFor="author">
            Author
          </label>
          <input id="author" name="author" maxLength={60} defaultValue={meme?.author} className={inputClass} placeholder="Shown under the title (leave empty to use the site name)" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700" htmlFor="body">
            Article text
          </label>
          <textarea
            id="body"
            name="body"
            rows={8}
            maxLength={20000}
            defaultValue={meme?.body}
            className={inputClass}
            placeholder="Optional full text shown on the article page. Leave a blank line between paragraphs."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-zinc-700" htmlFor="category">
              Category *
            </label>
            <select id="category" name="category" required defaultValue={meme?.category ?? CATEGORIES[0]} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-zinc-700" htmlFor="status">
              Status
            </label>
            <select id="status" name="status" defaultValue={meme?.status ?? "published"} className={inputClass}>
              <option value="published">Published (live now)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700" htmlFor="tags">
            Tags
          </label>
          <input id="tags" name="tags" defaultValue={meme?.tags.join(", ")} className={inputClass} placeholder="comma, separated, tags (max 10)" />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" name="featured" defaultChecked={meme?.featured} className="h-4 w-4 accent-brand" />
          Feature as the big hero on the home page
        </label>

        {error && (
          <div className="animate-slide-up rounded-lg bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-xs text-accent/80 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            disabled={saving || imageLoading || translating}
            className="relative rounded-lg bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isEdit ? "Saving…" : "Uploading…"}
              </>
            ) : isEdit ? (
              "✓ Save changes"
            ) : (
              "📤 Upload meme"
            )}
          </button>
          <Link href="/dashboard" className="rounded-lg px-4 py-2.5 font-medium text-zinc-600 hover:bg-zinc-100">
            Cancel
          </Link>
        </div>
      </form>

      <aside className="h-fit space-y-4 rounded-xl bg-white p-5 text-sm shadow-sm ring-1 ring-black/5">
        <h2 className="font-bold text-brand">What to upload</h2>
        <Guide title="Image">
          JPG, PNG, WEBP or GIF, up to 5 MB. Portrait 4:5 (for example 1080×1350) fills the feed best,
          but any shape works.
        </Guide>
        <Guide title="Where it shows up">
          Feed card (thumbnail), the meme page (full size), the Facebook and WhatsApp share preview,
          and the Trending list.
        </Guide>
        <Guide title="Title">Short and punchy, under about 80 characters. Bangla or English both work.</Guide>
        <Guide title="Description">Context or source in 1–3 sentences. Shown under the image.</Guide>
        <Guide title="Category">Pick the closest section. Categories are set in src/lib/config.ts.</Guide>
        <Guide title="Status">Draft is saved but hidden. Published goes live immediately.</Guide>
        <Guide title="Featured">Only the newest featured meme becomes the home-page hero.</Guide>
        <Guide title="Links">The URL slug is set once from the title and never changes on edit, so shared links keep working.</Guide>
      </aside>
    </div>
  );
}

function Guide({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-zinc-800">{title}</p>
      <p className="text-zinc-500">{children}</p>
    </div>
  );
}
