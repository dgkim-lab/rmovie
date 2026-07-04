import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { clearSuggestions } from "@/lib/activity-log";

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await clearSuggestions(session);
  return NextResponse.json({ deleted: result.count });
}
