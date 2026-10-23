import { describe, expect, it } from "vitest";
import { authenticateDemo } from "@/services/authService";

describe("demo authentication", () => {
  it("authenticates the administrator account without exposing its password", () => {
    const session = authenticateDemo(" ADMIN@ucc.edu.ph ", "Admin12345");

    expect(session.user.email).toBe("admin@ucc.edu.ph");
    expect(session.user.role).toBe("administrator");
    expect(session.user).not.toHaveProperty("password");
  });

  it("reports missing professor and staff accounts", () => {
    expect(() =>
      authenticateDemo("professor@ucc.edu.ph", "Professor123"),
    ).toThrow("Account does not exist.");
    expect(() =>
      authenticateDemo("staff@ucc.edu.ph", "Staff12345"),
    ).toThrow("Account does not exist.");
  });

  it("reports when an account does not exist", () => {
    expect(() => authenticateDemo("unknown@ucc.edu.ph", "Admin12345")).toThrow(
      "Account does not exist.",
    );
  });

  it("rejects incorrect passwords for existing accounts", () => {
    expect(() => authenticateDemo("admin@ucc.edu.ph", "wrong-password")).toThrow(
      "Email or password is incorrect.",
    );
  });
});
