CREATE TYPE "SuggestionStatus" AS ENUM ('SUGGESTED', 'ACCEPTED');

CREATE TABLE "movie_suggestions" (
    "id" UUID NOT NULL,
    "userSubject" TEXT NOT NULL,
    "authProvider" TEXT NOT NULL,
    "userEmail" TEXT,
    "sheetId" TEXT NOT NULL,
    "sheetRange" TEXT NOT NULL,
    "movieName" TEXT NOT NULL,
    "movieUrl" TEXT NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'SUGGESTED',
    "suggestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMPTZ(3),
    "traceId" TEXT,
    "acceptedTraceId" TEXT,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "movie_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "movie_suggestions_userSubject_suggestedAt_idx"
ON "movie_suggestions"("userSubject", "suggestedAt");

CREATE INDEX "movie_suggestions_status_suggestedAt_idx"
ON "movie_suggestions"("status", "suggestedAt");

CREATE INDEX "movie_suggestions_userSubject_deletedAt_suggestedAt_idx"
ON "movie_suggestions"("userSubject", "deletedAt", "suggestedAt");
