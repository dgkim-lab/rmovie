import type { Session } from "next-auth";
import { getDatabase } from "@/lib/database";
import { withSessionSpan } from "@/lib/telemetry";

export function listAllSuggestions(session: Session) {
  return withSessionSpan("admin.history.list", session, async () => (
    getDatabase().movieSuggestion.findMany({ orderBy: { suggestedAt: "desc" }, take: 500 })
  ));
}

export function setSuggestionDeleted(session: Session, id: string, deleted: boolean) {
  return withSessionSpan("admin.history.set_deleted", session, async () => (
    getDatabase().movieSuggestion.updateMany({
      where: { id },
      data: { deletedAt: deleted ? new Date() : null },
    })
  ), { "rmovie.suggestion.id": id, "rmovie.suggestion.deleted": deleted });
}

export function permanentlyDeleteSuggestion(session: Session, id: string) {
  return withSessionSpan("admin.history.delete", session, async () => (
    getDatabase().movieSuggestion.deleteMany({
      // Permanent deletion is deliberately a two-step operation.
      where: { id, deletedAt: { not: null } },
    })
  ), { "rmovie.suggestion.id": id });
}
