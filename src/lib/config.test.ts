import { afterEach, describe, expect, it } from "vitest";
import { getAuthConfig, getDebugConfig, getRedirectDelayMs } from "./config";

const originalEnv = { ...process.env };
afterEach(() => { process.env = { ...originalEnv }; });

describe("configuration", () => {
  it("uses documented defaults", () => {
    delete process.env.REDIRECT_DELAY_MS;
    delete process.env.RANDOM_ERROR_RATE;
    expect(getRedirectDelayMs()).toBe(4000);
    expect(getDebugConfig()).toEqual({ enabled: false, errorRate: 0.5 });
  });

  it("rejects invalid numeric values", () => {
    process.env.RANDOM_ERROR_RATE = "2";
    expect(() => getDebugConfig()).toThrow("RANDOM_ERROR_RATE");
  });

  it("rejects unknown auth providers", () => {
    process.env.AUTH_PROVIDER = "unknown";
    expect(() => getAuthConfig()).toThrow("AUTH_PROVIDER must be keycloak or cognito");
  });
});
