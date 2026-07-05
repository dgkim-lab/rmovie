import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteSuggestion } from "@/lib/activity-log";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Invalid suggestion ID" }, { status: 400 });
  const result = await deleteSuggestion(session, id);
  if (result.count === 0) return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
