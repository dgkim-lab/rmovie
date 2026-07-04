import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/database", () => ({
  getDatabase: () => ({ movieSuggestion: mocks }),
}));

vi.mock("@/lib/config", () => ({
  getAuthConfig: () => ({ provider: "cognito" }),
  getSheetConfig: () => ({ spreadsheetId: "sheet-123", range: "Movies!A:Z" }),
}));

import {
  acceptSuggestion,
  clearSuggestions,
  deleteSuggestion,
  recordSuggestion,
} from "./activity-log";

const session: Session = {
  expires: "2099-01-01T00:00:00.000Z",
  user: { id: "oidc-subject", email: "user@example.com" },
};

beforeEach(() => vi.clearAllMocks());

describe("activity logging", () => {
  it("records provider-qualified identity and Google Sheet source", async () => {
    mocks.create.mockResolvedValue({ id: "suggestion-id" });
    await recordSuggestion(session, { name: "Movie", url: "https://example.com/movie" });
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userSubject: "oidc-subject",
        authProvider: "cognito",
        sheetId: "sheet-123",
        sheetRange: "Movies!A:Z",
        movieName: "Movie",
      }),
    }));
  });

  it("accepts only the signed-in user's active suggestion", async () => {
    mocks.updateMany.mockResolvedValue({ count: 1 });
    await acceptSuggestion(session, "suggestion-id");
    expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: "suggestion-id",
        userSubject: "oidc-subject",
        authProvider: "cognito",
        acceptedAt: null,
        deletedAt: null,
      },
      data: expect.objectContaining({ status: "ACCEPTED" }),
    }));
  });

  it("soft deletes one row without crossing the user boundary", async () => {
    mocks.updateMany.mockResolvedValue({ count: 1 });
    await deleteSuggestion(session, "suggestion-id");
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        id: "suggestion-id",
        userSubject: "oidc-subject",
        authProvider: "cognito",
        deletedAt: null,
      },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("clears only the signed-in user's visible rows", async () => {
    mocks.updateMany.mockResolvedValue({ count: 3 });
    await clearSuggestions(session);
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        userSubject: "oidc-subject",
        authProvider: "cognito",
        deletedAt: null,
      },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
