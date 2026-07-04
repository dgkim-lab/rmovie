import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseUrl } from "@/lib/config";

const globalDatabase = globalThis as unknown as { prisma?: PrismaClient };

export function getDatabase() {
  const connectionString = getDatabaseUrl();

  if (!globalDatabase.prisma) {
    globalDatabase.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }
  return globalDatabase.prisma;
}
