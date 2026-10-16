import { randomBytes } from "crypto";
import { messagesCollection, type MessageDoc } from "./db";

export type ContactMessage = Omit<MessageDoc, "_id"> & { id: string };

const toMessage = ({ _id, ...rest }: MessageDoc): ContactMessage => ({ id: _id, ...rest });

export async function createMessage(input: Pick<MessageDoc, "name" | "email" | "subject" | "message">): Promise<void> {
  await (await messagesCollection()).insertOne({
    _id: randomBytes(12).toString("hex"),
    ...input,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function listMessages(limit = 1000): Promise<ContactMessage[]> {
  const docs = await (await messagesCollection()).find().sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(toMessage);
}

export async function countUnreadMessages(): Promise<number> {
  return (await messagesCollection()).countDocuments({ read: false });
}

export async function setMessageRead(id: string, read: boolean): Promise<boolean> {
  return (await (await messagesCollection()).updateOne({ _id: id }, { $set: { read } })).matchedCount > 0;
}

export async function deleteMessage(id: string): Promise<boolean> {
  return (await (await messagesCollection()).deleteOne({ _id: id })).deletedCount > 0;
}

export async function markAllMessagesRead(): Promise<number> {
  return (await (await messagesCollection()).updateMany({ read: false }, { $set: { read: true } })).modifiedCount;
}
