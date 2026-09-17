import { hashPassword, tokenDigest, verifyPassword } from "../src/modules/auth/password";

describe("password and token security", () => {
  it("salts and verifies passwords", async () => {
    const one = await hashPassword("Integration-pass-123");
    const two = await hashPassword("Integration-pass-123");
    expect(one).not.toBe(two);
    expect(one.startsWith("s1$")).toBe(true);
    expect(await verifyPassword("Integration-pass-123", one)).toBe(true);
    expect(await verifyPassword("wrong", one)).toBe(false);
  });

  it("keeps legacy password hashes readable during migration", async () => {
    const { scrypt, randomBytes } = await import("node:crypto");
    const { promisify } = await import("node:util");
    const derive = promisify(scrypt);
    const salt = randomBytes(16).toString("hex");
    const key = (await derive("legacy-password", salt, 64)) as Buffer;
    const legacy = `${salt}:${key.toString("hex")}`;
    expect(await verifyPassword("legacy-password", legacy)).toBe(true);
  });

  it("stores a fixed-size digest instead of a raw bearer token", () => {
    const digest = tokenDigest("secret-session-token");
    expect(Buffer.isBuffer(digest)).toBe(true);
    expect(digest).toHaveLength(32);
  });
});
