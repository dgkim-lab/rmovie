import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { setAdminRole } from "@/lib/users";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  try { requireAdmin(session); } catch { return NextResponse.json({ error: "Forbidden" }, { status: session ? 403 : 401 }); }
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  const body = await request.json().catch(() => null) as { admin?: unknown } | null;
  if (typeof body?.admin !== "boolean") return NextResponse.json({ error: "admin must be a boolean" }, { status: 400 });
  try {
    await setAdminRole(session, id, body.admin);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Role update failed" }, { status: 400 });
  }
}
