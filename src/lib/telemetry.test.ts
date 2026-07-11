import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";
import { endUserAttributes } from "./telemetry";

describe("end-user trace attributes", () => {
  it("maps the authenticated session to OpenTelemetry enduser attributes", () => {
    const session: Session = {
      expires: "2099-01-01T00:00:00.000Z",
      user: {
        id: "oidc-subject",
        localId: "local-user-id",
        roles: ["USER", "ADMIN"],
        email: "user@example.com",
        name: "Example User",
      },
    };

    expect(endUserAttributes(session)).toEqual({
      "enduser.id": "local-user-id",
      "enduser.role": "USER ADMIN",
      "enduser.email": "user@example.com",
      "enduser.name": "Example User",
      "rmovie.user.subject": "oidc-subject",
    });
  });

  it("omits email when the identity provider does not supply it", () => {
    const session: Session = {
      expires: "2099-01-01T00:00:00.000Z",
      user: { id: "oidc-subject", localId: "local-user-id", roles: ["USER"] },
    };

    expect(endUserAttributes(session)).toEqual({
      "enduser.id": "local-user-id",
      "enduser.role": "USER",
      "rmovie.user.subject": "oidc-subject",
    });
  });
});
