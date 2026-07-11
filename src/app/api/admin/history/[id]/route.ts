import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { permanentlyDeleteSuggestion, setSuggestionDeleted } from "@/lib/admin";
import { requireAdmin } from "@/lib/admin-auth";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  try { requireAdmin(session); } catch { return NextResponse.json({ error: "Forbidden" }, { status: session ? 403 : 401 }); }
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Invalid history ID" }, { status: 400 });
  const body = await request.json().catch(() => null) as { deleted?: unknown } | null;
  if (typeof body?.deleted !== "boolean") return NextResponse.json({ error: "deleted must be a boolean" }, { status: 400 });
  const result = await setSuggestionDeleted(id, body.deleted);
  if (!result.count) return NextResponse.json({ error: "History record not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  try { requireAdmin(session); } catch { return NextResponse.json({ error: "Forbidden" }, { status: session ? 403 : 401 }); }
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Invalid history ID" }, { status: 400 });
  const result = await permanentlyDeleteSuggestion(id);
  if (!result.count) {
    return NextResponse.json({ error: "History record not found or must be soft-deleted first" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
