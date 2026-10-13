import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, isValidSessionToken } from "./auth";

// Returns a 401 response when the caller is not logged in, or null when they are.
export async function requireAdmin(): Promise<NextResponse | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (await isValidSessionToken(token)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
