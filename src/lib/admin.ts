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
