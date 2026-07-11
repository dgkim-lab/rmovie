import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { clearSuggestions } from "@/lib/activity-log";
import { annotateActiveSpanWithEndUser } from "@/lib/telemetry";

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  annotateActiveSpanWithEndUser(session);
  const result = await clearSuggestions(session);
  return NextResponse.json({ deleted: result.count });
}
