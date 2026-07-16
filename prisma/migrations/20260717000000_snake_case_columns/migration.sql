ALTER TABLE "movie_suggestions" RENAME COLUMN "userSubject" TO "user_subject";
ALTER TABLE "movie_suggestions" RENAME COLUMN "authProvider" TO "auth_provider";
ALTER TABLE "movie_suggestions" RENAME COLUMN "userEmail" TO "user_email";
ALTER TABLE "movie_suggestions" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "movie_suggestions" RENAME COLUMN "sheetId" TO "sheet_id";
ALTER TABLE "movie_suggestions" RENAME COLUMN "sheetRange" TO "sheet_range";
ALTER TABLE "movie_suggestions" RENAME COLUMN "movieName" TO "movie_name";
ALTER TABLE "movie_suggestions" RENAME COLUMN "movieUrl" TO "movie_url";
ALTER TABLE "movie_suggestions" RENAME COLUMN "suggestedAt" TO "suggested_at";
ALTER TABLE "movie_suggestions" RENAME COLUMN "acceptedAt" TO "accepted_at";
ALTER TABLE "movie_suggestions" RENAME COLUMN "traceId" TO "trace_id";
ALTER TABLE "movie_suggestions" RENAME COLUMN "acceptedTraceId" TO "accepted_trace_id";
ALTER TABLE "movie_suggestions" RENAME COLUMN "deletedAt" TO "deleted_at";

ALTER TABLE "users" RENAME COLUMN "authProvider" TO "auth_provider";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "users" RENAME COLUMN "lastSeenAt" TO "last_seen_at";

ALTER TABLE "user_roles" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "user_roles" RENAME COLUMN "createdAt" TO "created_at";

ALTER INDEX "movie_suggestions_userSubject_suggestedAt_idx" RENAME TO "movie_suggestions_user_subject_suggested_at_idx";
ALTER INDEX "movie_suggestions_status_suggestedAt_idx" RENAME TO "movie_suggestions_status_suggested_at_idx";
ALTER INDEX "movie_suggestions_userSubject_deletedAt_suggestedAt_idx" RENAME TO "movie_suggestions_user_subject_deleted_at_suggested_at_idx";
ALTER INDEX "movie_suggestions_userId_suggestedAt_idx" RENAME TO "movie_suggestions_user_id_suggested_at_idx";
ALTER INDEX "users_authProvider_subject_key" RENAME TO "users_auth_provider_subject_key";

ALTER TABLE "user_roles" RENAME CONSTRAINT "user_roles_userId_fkey" TO "user_roles_user_id_fkey";
ALTER TABLE "movie_suggestions" RENAME CONSTRAINT "movie_suggestions_userId_fkey" TO "movie_suggestions_user_id_fkey";
