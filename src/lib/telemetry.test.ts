import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";
import { endUserAttributes } from "./telemetry";

describe("end-user telemetry", () => {
  it("uses OpenTelemetry user attributes for an authenticated session", () => {
    const session: Session = {
      expires: "2099-01-01T00:00:00.000Z",
      user: { id: "oidc-subject", email: "user@example.com" },
    };

    expect(endUserAttributes(session)).toEqual({
      "enduser.id": "oidc-subject",
      "user.email": "user@example.com",
    });
  });

  it("omits email when the identity provider does not supply it", () => {
    const session: Session = {
      expires: "2099-01-01T00:00:00.000Z",
      user: { id: "oidc-subject" },
    };

    expect(endUserAttributes(session)).toEqual({ "enduser.id": "oidc-subject" });
  });
});
