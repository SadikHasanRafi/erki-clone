import { statsCollection } from "./db";

const VISITS = "siteVisits";

// $inc with upsert is atomic, so concurrent visits never lose a count.
export async function incrementSiteVisits(): Promise<number> {
  const doc = await (await statsCollection()).findOneAndUpdate(
    { _id: VISITS },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return doc?.value ?? 0;
}

export async function getSiteVisits(): Promise<number> {
  return (await (await statsCollection()).findOne({ _id: VISITS }))?.value ?? 0;
}
