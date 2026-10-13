// Dashboard auth: one password from the environment, plus an HMAC-signed cookie.
// Uses Web Crypto only, so it runs in both the proxy and route handlers.

export const SESSION_COOKIE = "erki_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

async function digest(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.PASSWORD;
  if (!expected) return false;
  // Comparing digests keeps the comparison length-independent.
  return (await digest(input)) === (await digest(expected));
}

export async function createSessionToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [role, expiresStr, signature] = token.split(".");
  const expires = Number(expiresStr);
  if (role !== "admin" || !signature || !Number.isFinite(expires)) return false;
  if (expires * 1000 < Date.now()) return false;
  return signature === (await sign(`${role}.${expiresStr}`));
}
