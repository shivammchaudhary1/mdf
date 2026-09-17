import {
  hashPassword,
  verifyPassword,
  tokenDigest,
} from "../src/modules/auth/password";
describe("password and session security", () => {
  it("salts passwords and verifies only the matching password", async () => {
    const first = await hashPassword("a long test password");
    const second = await hashPassword("a long test password");
    expect(first).not.toBe(second);
    expect(await verifyPassword("a long test password", first)).toBe(true);
    expect(await verifyPassword("incorrect", first)).toBe(false);
    expect(await verifyPassword("incorrect", "invalid")).toBe(false);
  });
  it("stores token digests rather than bearer tokens", () => {
    expect(tokenDigest("test-session")).toHaveLength(64);
    expect(tokenDigest("test-session")).not.toBe(
      tokenDigest("another-session"),
    );
  });
});
