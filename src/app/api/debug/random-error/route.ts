import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDebugConfig } from "@/lib/config";
import { annotateActiveSpanWithEndUser, getErrorTraceContext, withSpan } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  const { enabled, errorRate } = getDebugConfig();
  if (!enabled) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  annotateActiveSpanWithEndUser(session);

  try {
    return await withSpan("debug.random_error", async () => {
      if (Math.random() < errorRate) throw new Error("Deliberate observability test error");
      return NextResponse.json({ status: "ok", deliberate: true });
    }, { "rmovie.debug.error_rate": errorRate });
  } catch (error) {
    const trace = getErrorTraceContext(error);
    console.error("Generated deliberate debug error", { ...trace, error });
    return NextResponse.json(
      {
        error: "Deliberate observability test error",
        errorId: trace?.errorId,
        traceId: trace?.traceId,
      },
      { status: 500 },
    );
  }
}
