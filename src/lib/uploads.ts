import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "./config";
import { UserFacingError } from "./api";

export type ImageStorageType = "vercel" | "url";

// The SDK reads BLOB_READ_WRITE_TOKEN; also accept the VERCEL_ prefixed name used in this project's .env.
export function blobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new UserFacingError(
      "Image storage is not set up: add BLOB_READ_WRITE_TOKEN to your .env file (Vercel dashboard > Storage > Blob > your store > Tokens), then restart the dev server.",
      500,
    );
  }
  return token;
}

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
  const token = blobToken();
  try {
    const blob = await put(name, buffer, { access: "public", contentType: file.type, token });
    return blob.url;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new UserFacingError(`Image upload to Vercel Blob failed: ${detail}`, 502);
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    await del(imageUrl, { token: blobToken() });
  } catch {
    // Ignore errors if image doesn't exist or URL is not a Vercel blob
  }
}
