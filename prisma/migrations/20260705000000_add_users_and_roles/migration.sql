CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "authProvider" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_roles" (
    "userId" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId", "role")
);

CREATE UNIQUE INDEX "users_authProvider_subject_key" ON "users"("authProvider", "subject");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "user_roles_role_idx" ON "user_roles"("role");
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "movie_suggestions" ADD COLUMN "userId" UUID;
CREATE INDEX "movie_suggestions_userId_suggestedAt_idx" ON "movie_suggestions"("userId", "suggestedAt");
ALTER TABLE "movie_suggestions" ADD CONSTRAINT "movie_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
