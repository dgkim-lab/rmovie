import { afterEach, describe, expect, it } from "vitest";
import {
  getAccountUrl,
  getAdminSubjects,
  getAuthConfig,
  getDebugConfig,
  getFederatedLogoutUrl,
  getRedirectDelayMs,
} from "./config";

const originalEnv = { ...process.env };
afterEach(() => { process.env = { ...originalEnv }; });

describe("configuration", () => {
  it("uses documented defaults", () => {
    delete process.env.REDIRECT_DELAY_MS;
    delete process.env.RANDOM_ERROR_RATE;
    expect(getRedirectDelayMs()).toBe(4000);
    expect(getDebugConfig()).toEqual({ enabled: false, errorRate: 0.5 });
  });

  it("parses bootstrap admin subjects", () => {
    process.env.ADMIN_USER_SUBJECTS = " first-subject, second-subject, ";
    expect([...getAdminSubjects()]).toEqual(["first-subject", "second-subject"]);
  });

  it("rejects invalid numeric values", () => {
    process.env.RANDOM_ERROR_RATE = "2";
    expect(() => getDebugConfig()).toThrow("RANDOM_ERROR_RATE");
  });

  it("rejects unknown auth providers", () => {
    process.env.AUTH_PROVIDER = "unknown";
    expect(() => getAuthConfig()).toThrow("AUTH_PROVIDER must be keycloak or cognito");
  });

  it("uses persistent nonce validation for Cognito federated login", () => {
    Object.assign(process.env, {
      AUTH_PROVIDER: "cognito",
      AUTH_ISSUER: "https://cognito-idp.example/pool",
      AUTH_CLIENT_ID: "client",
      AUTH_CLIENT_SECRET: "secret",
      AUTH_URL: "https://rmovie.example",
    });
    expect(getAuthConfig().checks).toEqual(["nonce"]);
  });

  it("leaves Keycloak OIDC checks at the Auth.js defaults", () => {
    Object.assign(process.env, {
      AUTH_PROVIDER: "keycloak",
      AUTH_ISSUER: "https://identity.example/realms/rmovie",
      AUTH_CLIENT_ID: "client",
      AUTH_CLIENT_SECRET: "secret",
      AUTH_URL: "https://rmovie.example",
    });
    expect(getAuthConfig().checks).toBeUndefined();
  });

  it("builds a Keycloak logout and account URL", () => {
    Object.assign(process.env, {
      AUTH_PROVIDER: "keycloak",
      AUTH_ISSUER: "https://identity.example/realms/rmovie",
      AUTH_CLIENT_ID: "rmovie",
      AUTH_CLIENT_SECRET: "secret",
      AUTH_URL: "https://rmovie.example",
    });
    expect(getFederatedLogoutUrl()).toBe(
      "https://identity.example/realms/rmovie/protocol/openid-connect/logout?client_id=rmovie&post_logout_redirect_uri=https%3A%2F%2Frmovie.example%2Flogin",
    );
    expect(getAccountUrl()).toBe("https://identity.example/realms/rmovie/account");
  });

  it("builds a Cognito logout URL and uses its configured account URL", () => {
    Object.assign(process.env, {
      AUTH_PROVIDER: "cognito",
      AUTH_ISSUER: "https://cognito-idp.example/pool",
      AUTH_CLIENT_ID: "client",
      AUTH_CLIENT_SECRET: "secret",
      AUTH_URL: "https://rmovie.example",
      AUTH_LOGOUT_URL: "https://login.example/logout",
      AUTH_ACCOUNT_URL: "https://rmovie.example/account",
    });
    expect(getFederatedLogoutUrl()).toBe(
      "https://login.example/logout?client_id=client&logout_uri=https%3A%2F%2Frmovie.example%2Flogin",
    );
    expect(getAccountUrl()).toBe("https://rmovie.example/account");
  });
});
