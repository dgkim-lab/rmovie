import { NextResponse } from "next/server";
import { validateRuntimeConfig } from "@/lib/config";

export function GET() {
  try {
    validateRuntimeConfig();
    return NextResponse.json({ status: "ready" });
  } catch (error) {
    console.error("Readiness configuration check failed", error);
    return NextResponse.json({ status: "not ready" }, { status: 503 });
  }
}
