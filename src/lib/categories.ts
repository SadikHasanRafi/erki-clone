import { randomBytes } from "crypto";
import { CATEGORIES, CATEGORY_COLORS } from "./config";
import { categoriesCollection, memesCollection } from "./db";
import type { Category } from "./types";

const FALLBACK_COLOR = "#52525b";

// The first time the site runs, the categories from config.ts are copied into the database.
// After that the dashboard owns them.
export async function listCategories(): Promise<Category[]> {
  const collection = await categoriesCollection();
  if ((await collection.estimatedDocumentCount()) === 0) {
    await collection
      .insertMany(
        CATEGORIES.map((name, order) => ({
          _id: randomBytes(12).toString("hex"),
          name,
          color: CATEGORY_COLORS[name] ?? FALLBACK_COLOR,
          order,
        })),
        { ordered: false },
      )
      .catch(() => undefined); // a concurrent request may have seeded already
  }
  const docs = await collection.find().sort({ order: 1, name: 1 }).toArray();
  return docs.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
}

export async function listCategoryNames(): Promise<string[]> {
  return (await listCategories()).map((c) => c.name);
}

export async function addCategory(name: string, color: string): Promise<Category> {
  const collection = await categoriesCollection();
  const last = await collection.find().sort({ order: -1 }).limit(1).toArray();
  const doc = { _id: randomBytes(12).toString("hex"), name, color, order: (last[0]?.order ?? -1) + 1 };
  await collection.insertOne(doc);
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

export async function updateCategoryColor(id: string, color: string): Promise<boolean> {
  const res = await (await categoriesCollection()).updateOne({ _id: id }, { $set: { color } });
  return res.matchedCount > 0;
}

// Returns the number of memes still using the category when it cannot be removed.
export async function deleteCategory(id: string): Promise<{ ok: true } | { ok: false; inUse: number } | null> {
  const collection = await categoriesCollection();
  const cat = await collection.findOne({ _id: id });
  if (!cat) return null;
  const inUse = await (await memesCollection()).countDocuments({ category: cat.name });
  if (inUse > 0) return { ok: false, inUse };
  await collection.deleteOne({ _id: id });
  return { ok: true };
}
