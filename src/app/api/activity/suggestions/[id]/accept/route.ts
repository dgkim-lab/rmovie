import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { acceptSuggestion } from "@/lib/activity-log";
import { annotateActiveSpanWithEndUser, getErrorTraceContext } from "@/lib/telemetry";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  annotateActiveSpanWithEndUser(session);
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Invalid suggestion ID" }, { status: 400 });

  try {
    const result = await acceptSuggestion(session, id);
    if (result.count === 0) return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const trace = getErrorTraceContext(error);
    console.error("Unable to accept suggestion", { ...trace, error });
    return NextResponse.json(
      { error: "Unable to record acceptance", errorId: trace?.errorId, traceId: trace?.traceId },
      { status: 500 },
    );
  }
}
