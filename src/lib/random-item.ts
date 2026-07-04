import { randomInt } from "node:crypto";

export interface RandomItem {
  name: string;
  url: string;
}

const requiredColumns = ["name", "url"] as const;
const normalizeHeader = (value: unknown) => String(value ?? "").trim().toLowerCase();

export function rowsToItems(rows: unknown[][]): RandomItem[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map(normalizeHeader);
  for (const column of requiredColumns) {
    if (!headers.includes(column)) throw new Error(`Missing required column: ${column}`);
  }

  return rows.slice(1).flatMap((columns) => {
    const record = Object.fromEntries(
      headers.map((header, index) => [header, String(columns[index] ?? "").trim()]),
    );
    if (!record.url) return [];
    assertHttpUrl(record.url);
    return [{ name: record.name, url: record.url }];
  });
}

export function assertHttpUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Sheet contains an invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Sheet URLs must use http or https");
  }
}

export function pickRandomItem(items: RandomItem[]): RandomItem {
  if (items.length === 0) throw new Error("No rows with a valid URL were found");
  return items[randomInt(items.length)];
}
