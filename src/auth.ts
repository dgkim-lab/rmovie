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

function providerSubject(profile?: Record<string, unknown>) {
  return typeof profile?.sub === "string" && profile.sub.length > 0 ? profile.sub : undefined;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [config.provider === "keycloak" ? Keycloak(options) : Cognito(options)],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, profile }) {
      const subject = providerSubject(profile);
      // Keep the provider's raw subject so activity ownership does not depend on Auth.js remapping.
      if (subject) token.providerSubject = subject;
      return token;
    },
    session({ session, token }) {
      if (typeof token.providerSubject === "string") session.user.id = token.providerSubject;
      else if (token.sub) session.user.id = token.sub;
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith(`${baseUrl}/`)) return url;
      if (url === getFederatedLogoutUrl()) return url;
      return baseUrl;
    },
  },
});
