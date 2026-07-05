import type { Session } from "next-auth";
import { getAdminSubjects, getAuthConfig } from "@/lib/config";
import { getDatabase } from "@/lib/database";

export async function syncUser(user: Session["user"]) {
  if (!user.id) throw new Error("Authenticated user has no OIDC subject");
  const authProvider = getAuthConfig().provider;
  const bootstrapAdmin = getAdminSubjects().has(user.id);
  const database = getDatabase();
  const localUser = await database.user.upsert({
    where: { authProvider_subject: { authProvider, subject: user.id } },
    create: {
      authProvider,
      subject: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      roles: { create: [{ role: "USER" }, ...(bootstrapAdmin ? [{ role: "ADMIN" as const }] : [])] },
    },
    update: {
      email: user.email,
      name: user.name,
      image: user.image,
      lastSeenAt: new Date(),
    },
    include: { roles: true },
  });
  if (!bootstrapAdmin || localUser.roles.some(({ role }) => role === "ADMIN")) return localUser;
  await database.userRole.create({ data: { userId: localUser.id, role: "ADMIN" } });
  return database.user.findUniqueOrThrow({ where: { id: localUser.id }, include: { roles: true } });
}

export function isAdmin(session: Session) {
  return session.user.roles.includes("ADMIN");
}

export async function listUsers() {
  return getDatabase().user.findMany({ include: { roles: true }, orderBy: { createdAt: "desc" } });
}

export async function setAdminRole(userId: string, enabled: boolean, actorUserId: string) {
  const database = getDatabase();
  if (!enabled && userId === actorUserId) throw new Error("You cannot remove your own admin role");
  if (enabled) {
    return database.userRole.upsert({ where: { userId_role: { userId, role: "ADMIN" } }, create: { userId, role: "ADMIN" }, update: {} });
  }
  const adminCount = await database.userRole.count({ where: { role: "ADMIN" } });
  if (adminCount <= 1) throw new Error("The last admin role cannot be removed");
  return database.userRole.deleteMany({ where: { userId, role: "ADMIN" } });
}
