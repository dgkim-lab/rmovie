export type AuthProvider = "keycloak" | "cognito";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function numberInRange(name: string, fallback: number, min: number, max: number) {
  const raw = process.env[name];
  const value = raw === undefined || raw === "" ? fallback : Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
  return value;
}

export function getAuthConfig() {
  const provider = required("AUTH_PROVIDER");
  if (provider !== "keycloak" && provider !== "cognito") {
    throw new Error("AUTH_PROVIDER must be keycloak or cognito");
  }
  return {
    provider: provider as AuthProvider,
    issuer: required("AUTH_ISSUER"),
    clientId: required("AUTH_CLIENT_ID"),
    clientSecret: required("AUTH_CLIENT_SECRET"),
    scopes: process.env.AUTH_SCOPES?.trim() || "openid",
    // Cognito does not advertise PKCE in discovery, so Auth.js falls back to a
    // nonce during sign-in. Configure it explicitly so the callback request
    // also consumes the nonce cookie and validates the returned ID token.
    checks: provider === "cognito" ? (["nonce"] as Array<"nonce">) : undefined,
    appUrl: required("AUTH_URL").replace(/\/$/, ""),
    logoutEndpoint: process.env.AUTH_LOGOUT_URL?.trim(),
    accountUrl: process.env.AUTH_ACCOUNT_URL?.trim(),
  };
}

export function getFederatedLogoutUrl() {
  const config = getAuthConfig();
  const returnUrl = `${config.appUrl}/login`;

  if (config.provider === "cognito") {
    if (!config.logoutEndpoint) {
      throw new Error("AUTH_LOGOUT_URL is required for Cognito federated logout");
    }
    const url = new URL(config.logoutEndpoint);
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("logout_uri", returnUrl);
    return url.toString();
  }

  const url = new URL(
    config.logoutEndpoint || `${config.issuer.replace(/\/$/, "")}/protocol/openid-connect/logout`,
  );
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("post_logout_redirect_uri", returnUrl);
  return url.toString();
}

export function getAccountUrl() {
  const config = getAuthConfig();
  if (config.accountUrl) return config.accountUrl;
  if (config.provider === "keycloak") return `${config.issuer.replace(/\/$/, "")}/account`;
  return null;
}

export function getSheetConfig() {
  return {
    spreadsheetId: required("GOOGLE_SHEETS_SPREADSHEET_ID"),
    range: process.env.GOOGLE_SHEETS_RANGE?.trim() || "Sheet1",
  };
}

export function getDatabaseUrl() {
  return required("DATABASE_URL");
}

export function getRedirectDelayMs() {
  return numberInRange("REDIRECT_DELAY_MS", 4000, 0, 60_000);
}

export function getDebugConfig() {
  return {
    enabled: process.env.ENABLE_DEBUG_ENDPOINTS === "true",
    errorRate: numberInRange("RANDOM_ERROR_RATE", 0.5, 0, 1),
  };
}

export function validateRuntimeConfig() {
  getAuthConfig();
  getSheetConfig();
  getDatabaseUrl();
  getRedirectDelayMs();
  getDebugConfig();
}
