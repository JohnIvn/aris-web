import { describe, expect, it } from "vitest";
import { authenticateDemo } from "@/services/authService";

describe("demo authentication", () => {
  it("authenticates the administrator account without exposing its password", () => {
    const session = authenticateDemo(" ADMIN@aris.edu.ph ", "Admin12345");

    expect(session.user.email).toBe("admin@aris.edu.ph");
    expect(session.user.role).toBe("administrator");
    expect(session.user).not.toHaveProperty("password");
  });

  it("authenticates the professor account", () => {
    const session = authenticateDemo("professor@aris.edu.ph", "Professor123");

    expect(session.user.role).toBe("professor");
  });

  it("rejects unknown accounts and incorrect passwords", () => {
    expect(() => authenticateDemo("unknown@aris.edu.ph", "Admin12345")).toThrow(
      "Email or password is incorrect.",
    );
    expect(() => authenticateDemo("admin@aris.edu.ph", "wrong-password")).toThrow(
      "Email or password is incorrect.",
    );
  });
});
