import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRandomSheetItem } from "@/lib/google-sheets";
import { getErrorTraceContext } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await auth())?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await getRandomSheetItem(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const trace = getErrorTraceContext(error);
    console.error("Unable to select a random item", { ...trace, error });
    return NextResponse.json(
      { error: "Unable to load a random item", errorId: trace?.errorId, traceId: trace?.traceId },
      { status: 500 },
    );
  }
}
