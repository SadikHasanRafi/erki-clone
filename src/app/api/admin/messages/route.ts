import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { markAllMessagesRead } from "@/lib/messages";

export const dynamic = "force-dynamic";

// Marks every unread message as read.
export async function PATCH() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json({ updated: await markAllMessagesRead() });
  } catch (err) {
    return errorResponse(err);
  }
}
