import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
import Keycloak from "next-auth/providers/keycloak";
import { getAuthConfig, getFederatedLogoutUrl } from "@/lib/config";

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
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith(`${baseUrl}/`)) return url;
      if (url === getFederatedLogoutUrl()) return url;
      return baseUrl;
    },
  },
});
