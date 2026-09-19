import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

import { sha256 } from "../../common/utils/crypto";

const VERSION = "s1";
const N = 16_384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      {
        N,
        r: R,
        p: P,
        maxmem: MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

function deriveLegacyKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
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
    const key = await deriveLegacyKey(password, saltHex);
    const expected = Buffer.from(hashHex, "hex");

    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

export async function verifyPassword(password: string, stored?: string) {
  if (!stored) return false;

  if (!stored.startsWith(`${VERSION}$`)) {
    return verifyLegacy(password, stored);
  }

  const [version, n, r, p, saltValue, hashValue] = stored.split("$");

  if (version !== VERSION || Number(n) !== N || Number(r) !== R || Number(p) !== P || !saltValue || !hashValue) {
    return false;
  }

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(hashValue, "base64url");
    const key = await deriveKey(password, salt);

    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

export function tokenDigest(token: string) {
  return sha256(token);
}
