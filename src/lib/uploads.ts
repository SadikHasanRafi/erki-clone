import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "./config";

export type ImageStorageType = "vercel" | "url";

export function validateImage(file: File): string | null {
  if (!Object.hasOwn(ALLOWED_IMAGE_TYPES, file.type)) {
    return "Image must be JPG, PNG, WEBP or GIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return (response.ok && response.headers.get("content-type")?.startsWith("image/")) ?? false;
  } catch {
    return false;
  }
}

export async function saveImage(file: File): Promise<string> {
  const name = `${randomUUID()}.${ALLOWED_IMAGE_TYPES[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await put(name, buffer, { access: "public", contentType: file.type });
  return blob.url;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    await del(imageUrl);
  } catch {
    // Ignore errors if image doesn't exist or URL is not a Vercel blob
  }
}
