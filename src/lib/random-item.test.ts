import { describe, expect, it } from "vitest";
import { assertHttpUrl, pickRandomItem, rowsToItems } from "./random-item";

describe("rowsToItems", () => {
  it("normalizes headers and removes rows without a URL", () => {
    expect(rowsToItems([
      [" Name ", "URL", "ignored"],
      ["First", "https://example.com/1", "x"],
      ["Empty", "", "x"],
    ])).toEqual([{ name: "First", url: "https://example.com/1" }]);
  });

  it("requires name and url headers", () => {
    expect(() => rowsToItems([["title", "url"]])).toThrow("Missing required column: name");
  });

  it("rejects unsafe URL schemes", () => {
    expect(() => rowsToItems([["name", "url"], ["Bad", "javascript:alert(1)"]]))
      .toThrow("Sheet URLs must use http or https");
  });
});

describe("URL and selection helpers", () => {
  it("accepts HTTPS URLs", () => expect(() => assertHttpUrl("https://example.com")).not.toThrow());
  it("rejects an empty item list", () => expect(() => pickRandomItem([])).toThrow());
});
