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
  };
}

export function getSheetConfig() {
  return {
    spreadsheetId: required("GOOGLE_SHEETS_SPREADSHEET_ID"),
    range: process.env.GOOGLE_SHEETS_RANGE?.trim() || "Sheet1",
  };
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
  getRedirectDelayMs();
  getDebugConfig();
}
