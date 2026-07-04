import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRandomSheetItem } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await auth())?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await getRandomSheetItem(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Unable to select a random item", error);
    return NextResponse.json({ error: "Unable to load a random item" }, { status: 500 });
  }
}
