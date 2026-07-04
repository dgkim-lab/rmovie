import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDebugConfig } from "@/lib/config";
import { withSpan } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  const { enabled, errorRate } = getDebugConfig();
  if (!enabled) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await auth())?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return await withSpan("debug.random_error", async () => {
      if (Math.random() < errorRate) throw new Error("Deliberate observability test error");
      return NextResponse.json({ status: "ok", deliberate: true });
    }, { "rmovie.debug.error_rate": errorRate });
  } catch (error) {
    console.error("Generated deliberate debug error", error);
    return NextResponse.json({ error: "Deliberate observability test error" }, { status: 500 });
  }
}
