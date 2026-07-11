import { trace } from "@opentelemetry/api";
import type { Session } from "next-auth";
import { getAuthConfig, getSheetConfig } from "@/lib/config";
import { getDatabase } from "@/lib/database";
import type { RandomItem } from "@/lib/random-item";
import { annotateActiveSpanWithEndUser, withSpan } from "@/lib/telemetry";

function userIdentity(session: Session) {
  if (!session.user.id) throw new Error("Authenticated user has no OIDC subject");
  annotateActiveSpanWithEndUser(session);
  return {
    userSubject: session.user.id,
    authProvider: getAuthConfig().provider,
  };
}

function activeTraceId() {
  return trace.getActiveSpan()?.spanContext().traceId;
}

export function recordSuggestion(session: Session, item: RandomItem) {
  return withSpan("activity.suggestion.create", async () => {
    const identity = userIdentity(session);
    const source = getSheetConfig();
    return getDatabase().movieSuggestion.create({
      data: {
        ...identity,
        userId: session.user.localId,
        userEmail: session.user.email,
        sheetId: source.spreadsheetId,
        sheetRange: source.range,
        movieName: item.name,
        movieUrl: item.url,
        traceId: activeTraceId(),
      },
      select: { id: true },
    });
  });
}

export function acceptSuggestion(session: Session, id: string) {
  return withSpan("activity.suggestion.accept", async () => {
    const identity = userIdentity(session);
    return getDatabase().movieSuggestion.updateMany({
      where: { id, ...identity, acceptedAt: null, deletedAt: null },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        acceptedTraceId: activeTraceId(),
      },
    });
  }, { "rmovie.suggestion.id": id });
}

export function listSuggestions(session: Session) {
  return withSpan("activity.suggestion.list", async () => {
    const identity = userIdentity(session);
    return getDatabase().movieSuggestion.findMany({
      where: { ...identity, deletedAt: null },
      orderBy: { suggestedAt: "desc" },
      take: 100,
    });
  });
}

export function deleteSuggestion(session: Session, id: string) {
  return withSpan("activity.suggestion.delete", async () => {
    const identity = userIdentity(session);
    return getDatabase().movieSuggestion.updateMany({
      where: { id, ...identity, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }, { "rmovie.suggestion.id": id });
}

export function clearSuggestions(session: Session) {
  return withSpan("activity.suggestion.clear", async () => {
    const identity = userIdentity(session);
    return getDatabase().movieSuggestion.updateMany({
      where: { ...identity, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  });
}
