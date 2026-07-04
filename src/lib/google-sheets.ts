import fs from "node:fs/promises";
import path from "node:path";
import { google, type Auth } from "googleapis";
import { getSheetConfig } from "@/lib/config";
import { pickRandomItem, rowsToItems } from "@/lib/random-item";
import { withSpan } from "@/lib/telemetry";

async function credentials(): Promise<Auth.JWTInput> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) as Auth.JWTInput;
  }
  const filename = process.env.GOOGLE_CREDENTIALS_FILE || "credentials.json";
  return JSON.parse(
    await fs.readFile(
      path.resolve(/* turbopackIgnore: true */ process.cwd(), filename),
      "utf8",
    ),
  ) as Auth.JWTInput;
}

export async function getRandomSheetItem() {
  return withSpan("google_sheets.random_item", async () => {
    const { spreadsheetId, range } = getSheetConfig();
    const auth = new google.auth.GoogleAuth({
      credentials: await credentials(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return pickRandomItem(rowsToItems(response.data.values ?? []));
  });
}
