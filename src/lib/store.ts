import { randomBytes } from "crypto";
import { memesCollection, toMeme, type MemeDoc } from "./db";
import type { Meme, MemeStatus } from "./types";

export type MemeInput = {
  title: string;
  description: string;
  author: string;
  body: string;
  sourceUrl: string;
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

type ListOpts = {
  includeDrafts?: boolean;
  category?: string;
  tag?: string;
  q?: string;
  limit?: number;
  skip?: number;
  sort?: "latest" | "views";
  featured?: boolean;
  excludeId?: string;
};

function buildFilter(opts: ListOpts): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (!opts.includeDrafts) filter.status = "published";
  if (opts.category) filter.category = opts.category;
  if (opts.tag) filter.tags = opts.tag;
  if (opts.featured) filter.featured = true;
  if (opts.excludeId) filter._id = { $ne: opts.excludeId };

  const q = opts.q?.trim();
  if (q) {
    // Escape regex metacharacters so user input is matched literally.
    const pattern = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ title: pattern }, { description: pattern }, { tags: pattern }];
  }
  return filter;
}

export async function countMemes(opts: ListOpts = {}): Promise<number> {
  return (await memesCollection()).countDocuments(buildFilter(opts));
}

// Every tag used by published memes with how many memes use it, most used first.
export async function listTags(limit = 30): Promise<{ tag: string; count: number }[]> {
  const rows = await (await memesCollection())
    .aggregate<{ _id: string; count: number }>([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: limit },
    ])
    .toArray();
  return rows.map((r) => ({ tag: r._id, count: r.count }));
}

export async function listMemes(opts: ListOpts = {}): Promise<Meme[]> {
  const collection = await memesCollection();
  const filter = buildFilter(opts);

  const docs = await collection
    .find(filter)
    .sort(opts.sort === "views" ? { views: -1, createdAt: -1 } : { createdAt: -1 })
    .skip(opts.skip ?? 0)
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
