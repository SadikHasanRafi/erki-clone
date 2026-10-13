import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, isValidSessionToken } from "./auth";

// Returns a 401 response when the caller is not logged in, or null when they are.
export async function requireAdmin(): Promise<NextResponse | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (await isValidSessionToken(token)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// An error whose message is safe and useful to show to the dashboard user.
export class UserFacingError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

// Turns any thrown error into a JSON response with a readable message.
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof UserFacingError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  const detail = err instanceof Error ? err.message : String(err);
  const message = /MONGODB_URI|ECONNREFUSED|ENOTFOUND|MongoServerSelection|MongoNetwork/i.test(detail)
    ? "Cannot reach the database. Check MONGODB_URI in your .env file and that your IP is allowed in MongoDB Atlas."
    : /blob/i.test(detail)
      ? `Image storage error: ${detail}`
      : "Unexpected server error. Check the terminal running `npm run dev` for details.";
  return NextResponse.json({ error: message }, { status: 500 });
}
