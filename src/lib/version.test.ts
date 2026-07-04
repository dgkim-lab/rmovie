import { afterEach, describe, expect, it } from "vitest";
import { getAppVersion } from "./version";

const originalVersion = process.env.NEXT_PUBLIC_APP_VERSION;

afterEach(() => {
  if (originalVersion === undefined) delete process.env.NEXT_PUBLIC_APP_VERSION;
  else process.env.NEXT_PUBLIC_APP_VERSION = originalVersion;
});

describe("application version", () => {
  it("uses the build-injected version", () => {
    process.env.NEXT_PUBLIC_APP_VERSION = "v1.2.3-4-gabcdef0";
    expect(getAppVersion()).toBe("v1.2.3-4-gabcdef0");
  });

  it("falls back to dev", () => {
    delete process.env.NEXT_PUBLIC_APP_VERSION;
    expect(getAppVersion()).toBe("dev");
  });
});
