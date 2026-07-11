import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";

const movieSuggestion = vi.hoisted(() => ({
  deleteMany: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/database", () => ({
  getDatabase: () => ({ movieSuggestion }),
}));

import { permanentlyDeleteSuggestion, setSuggestionDeleted } from "./admin";

const session: Session = {
  expires: "2099-01-01T00:00:00.000Z",
  user: { id: "oidc-subject", localId: "local-user-id", roles: ["ADMIN"], email: "admin@example.com" },
};

beforeEach(() => vi.clearAllMocks());

describe("admin history management", () => {
  it("soft deletes history", async () => {
    movieSuggestion.updateMany.mockResolvedValue({ count: 1 });
    await setSuggestionDeleted(session, "history-id", true);
    expect(movieSuggestion.updateMany).toHaveBeenCalledWith({
      where: { id: "history-id" },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("only permanently deletes previously soft-deleted history", async () => {
    movieSuggestion.deleteMany.mockResolvedValue({ count: 1 });
    await permanentlyDeleteSuggestion(session, "history-id");
    expect(movieSuggestion.deleteMany).toHaveBeenCalledWith({
      where: { id: "history-id", deletedAt: { not: null } },
    });
  });
});
