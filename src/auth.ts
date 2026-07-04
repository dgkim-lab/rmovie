import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
import Keycloak from "next-auth/providers/keycloak";
import { getAuthConfig } from "@/lib/config";

const config = getAuthConfig();
const options = {
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  issuer: config.issuer,
  authorization: { params: { scope: config.scopes } },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [config.provider === "keycloak" ? Keycloak(options) : Cognito(options)],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
});
