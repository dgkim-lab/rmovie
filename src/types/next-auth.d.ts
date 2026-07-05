import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      localId: string;
      roles: Array<"ADMIN" | "USER">;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    providerSubject?: string;
  }
}
