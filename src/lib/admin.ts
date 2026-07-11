import { getDatabase } from "@/lib/database";

export function listAllSuggestions() {
  return getDatabase().movieSuggestion.findMany({ orderBy: { suggestedAt: "desc" }, take: 500 });
}

export function setSuggestionDeleted(id: string, deleted: boolean) {
  return getDatabase().movieSuggestion.updateMany({
    where: { id },
    data: { deletedAt: deleted ? new Date() : null },
  });
}

export function permanentlyDeleteSuggestion(id: string) {
  return getDatabase().movieSuggestion.deleteMany({
    // Permanent deletion is deliberately a two-step operation.
    where: { id, deletedAt: { not: null } },
  });
}
