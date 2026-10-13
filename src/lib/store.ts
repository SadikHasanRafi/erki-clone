import { randomBytes } from "crypto";
import { memesCollection, toMeme, type MemeDoc } from "./db";
import type { Meme, MemeStatus } from "./types";

export type MemeInput = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: MemeStatus;
  featured: boolean;
};

// Turns a title into a URL slug. \p{M} keeps Bangla vowel signs, which are combining marks.
async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
  const collection = await memesCollection();
  const base =
    title
      .toLowerCase()
      .normalize("NFC")
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "meme";

  let slug = base;
  while (await collection.findOne({ slug, _id: { $ne: ignoreId ?? "" } }, { projection: { _id: 1 } })) {
    slug = `${base}-${randomBytes(2).toString("hex")}`;
  }
  return slug;
}

export async function listMemes(
  opts: { includeDrafts?: boolean; category?: string; q?: string; limit?: number } = {},
): Promise<Meme[]> {
  const collection = await memesCollection();
  const filter: Record<string, unknown> = {};
  if (!opts.includeDrafts) filter.status = "published";
  if (opts.category) filter.category = opts.category;

  const q = opts.q?.trim();
  if (q) {
    // Escape regex metacharacters so user input is matched literally.
    const pattern = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ title: pattern }, { description: pattern }, { tags: pattern }];
  }

  const docs = await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(opts.limit ?? 0)
    .toArray();
  return docs.map(toMeme);
}

export async function getMemeBySlug(slug: string): Promise<Meme | null> {
  const doc = await (await memesCollection()).findOne({ slug });
  return doc ? toMeme(doc) : null;
}

export async function getMemeById(id: string): Promise<Meme | null> {
  const doc = await (await memesCollection()).findOne({ _id: id });
  return doc ? toMeme(doc) : null;
}

export async function createMeme(input: MemeInput, imageUrl: string): Promise<Meme> {
  const now = new Date().toISOString();
  const doc: MemeDoc = {
    _id: randomBytes(12).toString("hex"),
    ...input,
    slug: await uniqueSlug(input.title),
    imageUrl,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };
  await (await memesCollection()).insertOne(doc);
  return toMeme(doc);
}

// The slug is kept on edit so links shared on Facebook or WhatsApp never break.
export async function updateMeme(
  id: string,
  patch: Partial<MemeInput> & { imageUrl?: string },
): Promise<Meme | null> {
  const collection = await memesCollection();
  // Drop undefined keys so an omitted image does not wipe the stored one.
  const fields = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  const doc = await collection.findOneAndUpdate(
    { _id: id },
    { $set: { ...fields, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" },
  );
  return doc ? toMeme(doc) : null;
}

export async function deleteMeme(id: string): Promise<Meme | null> {
  const doc = await (await memesCollection()).findOneAndDelete({ _id: id });
  return doc ? toMeme(doc) : null;
}

// $inc is atomic in MongoDB, so concurrent views never lose a count.
export async function incrementViews(slug: string): Promise<number | null> {
  const doc = await (await memesCollection()).findOneAndUpdate(
    { slug, status: "published" },
    { $inc: { views: 1 } },
    { returnDocument: "after", projection: { views: 1 } },
  );
  return doc?.views ?? null;
}
