import type { Session } from "next-auth";
import { isAdmin } from "@/lib/users";

export function requireAdmin(session: Session | null): asserts session is Session {
  if (!session?.user || !isAdmin(session)) throw new Error("FORBIDDEN");
}
