import { CATEGORIES } from "./config";
import type { MemeInput } from "./store";
import { validateImage } from "./uploads";

export type ParsedMemeForm =
  | { ok: true; input: MemeInput; image: File | null; imageUrl: string | null }
  | { ok: false; error: string };

export function parseMemeForm(
  form: FormData,
  { requireImage }: { requireImage: boolean },
): ParsedMemeForm {
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const author = String(form.get("author") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const status = String(form.get("status") ?? "draft");
  const tags = String(form.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
  const featured = form.get("featured") === "on";
  const upload = form.get("image");
  const imageUrlInput = String(form.get("imageUrl") ?? "").trim();

  // An empty file input still arrives as a File with size 0, so treat that as "no file".
  const image = upload instanceof File && upload.size > 0 ? upload : null;
  const imageUrl = imageUrlInput && isValidUrl(imageUrlInput) ? imageUrlInput : null;

  if (!title || title.length > 120) {
    return { ok: false, error: "Title is required (max 120 characters)." };
  }
  if (description.length > 1000) {
    return { ok: false, error: "Description is too long (max 1000 characters)." };
  }
  if (author.length > 60) {
    return { ok: false, error: "Author name is too long (max 60 characters)." };
  }
  if (body.length > 20000) {
    return { ok: false, error: "Article text is too long (max 20,000 characters)." };
  }
  if (!CATEGORIES.includes(category)) {
    return { ok: false, error: "Pick a valid category." };
  }
  if (status !== "draft" && status !== "published") {
    return { ok: false, error: "Status must be draft or published." };
  }
  if (requireImage && !image && !imageUrl) {
    return { ok: false, error: "Please choose an image or provide an image URL." };
  }
  if (image && imageUrl) {
    return { ok: false, error: "Choose either file upload or URL, not both." };
  }
  if (image) {
    const imageError = validateImage(image);
    if (imageError) return { ok: false, error: imageError };
  }

  return {
    ok: true,
    input: { title, description, author, body, category, tags, status, featured },
    image,
    imageUrl,
  };
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}
