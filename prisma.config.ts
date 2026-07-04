import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Generation and builds do not connect to this fallback URL. Runtime and
    // migration commands still require the real DATABASE_URL.
    url: process.env.DATABASE_URL || "postgresql://build:build@localhost:5432/build",
  },
});
