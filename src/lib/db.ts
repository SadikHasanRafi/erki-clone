import { MongoClient, type Collection, type Db } from "mongodb";
import type { Category, Meme } from "./types";

// Stored document: the meme's `id` lives in `_id` so MongoDB's own key is used.
export type MemeDoc = Omit<Meme, "id"> & { _id: string };

export type CategoryDoc = Omit<Category, "id"> & { _id: string };

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "erki_clone";

// Cache the client on globalThis so dev hot-reloads don't open a new connection every time.
const globalForMongo = globalThis as unknown as { mongoClient?: Promise<MongoClient> };

function getClient(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  if (!globalForMongo.mongoClient) {
    const pending = new MongoClient(uri).connect();
    globalForMongo.mongoClient = pending;
    // A failed connect must not stay cached, or every later request fails until a restart.
    pending.catch(() => {
      if (globalForMongo.mongoClient === pending) globalForMongo.mongoClient = undefined;
    });
  }
  return globalForMongo.mongoClient;
}

let indexesReady: Promise<void> | null = null;

export async function memesCollection(): Promise<Collection<MemeDoc>> {
  const db: Db = (await getClient()).db(dbName);
  const collection = db.collection<MemeDoc>("memes");
  indexesReady ??= Promise.all([
    collection.createIndex({ slug: 1 }, { unique: true }),
    collection.createIndex({ status: 1, createdAt: -1 }),
    collection.createIndex({ category: 1 }),
    collection.createIndex({ tags: 1 }),
  ]).then(() => undefined);
  await indexesReady;
  return collection;
}

export function toMeme(doc: MemeDoc): Meme {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

let categoryIndexReady: Promise<void> | null = null;

export async function categoriesCollection(): Promise<Collection<CategoryDoc>> {
  const collection = (await getClient()).db(dbName).collection<CategoryDoc>("categories");
  categoryIndexReady ??= collection.createIndex({ name: 1 }, { unique: true }).then(() => undefined);
  await categoryIndexReady;
  return collection;
}

// Single "site" document holding everything the dashboard's Settings, Pages and Homepage screens edit.
export type SettingsDoc = { _id: string; data: unknown; updatedAt: string };

export async function settingsCollection(): Promise<Collection<SettingsDoc>> {
  return (await getClient()).db(dbName).collection<SettingsDoc>("settings");
}

export type MessageDoc = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

let messageIndexReady: Promise<void> | null = null;

export async function messagesCollection(): Promise<Collection<MessageDoc>> {
  const collection = (await getClient()).db(dbName).collection<MessageDoc>("messages");
  messageIndexReady ??= collection.createIndex({ createdAt: -1 }).then(() => undefined);
  await messageIndexReady;
  return collection;
}

// Site-wide counters, one document per counter name.
export type StatDoc = { _id: string; value: number };

export async function statsCollection(): Promise<Collection<StatDoc>> {
  return (await getClient()).db(dbName).collection<StatDoc>("stats");
}
