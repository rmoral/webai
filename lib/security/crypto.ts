import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";

// Server-only. Application-level encryption for Pro document text
// (defense in depth on top of Supabase's at-rest encryption) and
// keyed IP hashing so raw IPs are never stored (GDPR pseudonymization).

function getKey(): Buffer {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw) throw new Error("DATA_ENCRYPTION_KEY is not set");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  }
  return key;
}

/** AES-256-GCM. Output format: `v1.<iv>.<authTag>.<ciphertext>` (base64url). */
export function encryptText(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    data.toString("base64url"),
  ].join(".");
}

export function decryptText(payload: string): string {
  const [version, iv, tag, data] = payload.split(".");
  if (version !== "v1" || !iv || !tag || !data) {
    throw new Error("Invalid encrypted payload");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** Deterministic keyed hash for anonymous subjects (quotas, `ip_hash` columns). */
export function hashIp(ip: string): string {
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) throw new Error("IP_HASH_SECRET is not set");
  return createHmac("sha256", secret).update(ip).digest("base64url");
}

/**
 * The network an address belongs to, for keying anonymous quotas.
 *
 * An IPv6 device rotates its privacy addresses inside its /64, so keyed by
 * the full address one phone was a new visitor every few hours -- with a
 * fresh allowance each time. Keyed by the /64 it is one visitor, which is
 * also how rate limiters treat IPv6. IPv4, and IPv4 mapped into IPv6, are
 * kept whole.
 */
export function quotaNetwork(ip: string): string {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) return mapped[1];
  if (!ip.includes(":")) return ip;
  const [head, tail = ""] = ip.toLowerCase().split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = ip.includes("::")
    ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right]
    : left;
  return `${groups
    .slice(0, 4)
    .map((g) => g.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

/** The quota subject of a signed-out visitor: their network, hashed. */
export function anonymousSubject(ip: string): string {
  return `ip:${hashIp(quotaNetwork(ip))}`;
}
