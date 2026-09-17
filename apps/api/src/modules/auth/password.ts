import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { sha256 } from "../../common/utils/crypto";
const derive = promisify(scrypt);
const VERSION = "s1";
const N = 16_384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;
async function deriveKey(password: string, salt: Buffer) {
  return (await derive(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: MAX_MEMORY })) as Buffer;
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return [VERSION, String(N), String(R), String(P), salt.toString("base64url"), key.toString("base64url")].join("$");
}
async function verifyLegacy(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const key = (await derive(password, saltHex, 64)) as Buffer;
    const expected = Buffer.from(hashHex, "hex");
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch { return false; }
}
export async function verifyPassword(password: string, stored?: string) {
  if (!stored) return false;
  if (!stored.startsWith(`${VERSION}$`)) return verifyLegacy(password, stored);
  const [version, n, r, p, saltValue, hashValue] = stored.split("$");
  if (version !== VERSION || Number(n) !== N || Number(r) !== R || Number(p) !== P || !saltValue || !hashValue) return false;
  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(hashValue, "base64url");
    const key = await deriveKey(password, salt);
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch { return false; }
}
export function tokenDigest(token: string) { return sha256(token); }
