import { beforeEach, describe, expect, it, vi } from "vitest";

const movieSuggestion = vi.hoisted(() => ({
  deleteMany: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/database", () => ({
  getDatabase: () => ({ movieSuggestion }),
}));

import { permanentlyDeleteSuggestion, setSuggestionDeleted } from "./admin";

beforeEach(() => vi.clearAllMocks());

describe("admin history management", () => {
  it("soft deletes history", async () => {
    movieSuggestion.updateMany.mockResolvedValue({ count: 1 });
    await setSuggestionDeleted("history-id", true);
    expect(movieSuggestion.updateMany).toHaveBeenCalledWith({
      where: { id: "history-id" },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("only permanently deletes previously soft-deleted history", async () => {
    movieSuggestion.deleteMany.mockResolvedValue({ count: 1 });
    await permanentlyDeleteSuggestion("history-id");
    expect(movieSuggestion.deleteMany).toHaveBeenCalledWith({
      where: { id: "history-id", deletedAt: { not: null } },
    });
  });
});
