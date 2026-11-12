import {
  randomBytes,
  scrypt as derive,
  timingSafeEqual,
  createHash,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
function scrypt(password: string, salt: string, cost: number) {
  return new Promise<Buffer>((resolve, reject) =>
    derive(
      password,
      salt,
      64,
      { N: cost, r: 8, p: 1, maxmem: 256 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  );
}
export const makeToken = () => randomBytes(32).toString("hex");
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 131072);
  return `scrypt:${salt}:${key.toString("hex")}:131072`;
}
export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hex, cost] = stored.split(":");
  if (
    scheme !== "scrypt" ||
    !salt ||
    !/^[a-f0-9]{32}$/.test(salt) ||
    !hex ||
    !/^[a-f0-9]{128}$/.test(hex) ||
    (cost !== undefined && cost !== "131072")
  )
    return false;
  const key = await scrypt(password, salt, cost ? 131072 : 16384);
  return timingSafeEqual(key, Buffer.from(hex, "hex"));
}
export function seal(text: string, key: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("hex"),
    cipher.getAuthTag().toString("hex"),
    encrypted.toString("hex"),
  ].join(".");
}
export function unseal(text: string, key: string) {
  const [iv, tag, payload] = text.split(".");
  if (
    !iv ||
    !tag ||
    !payload ||
    !/^[a-f0-9]+$/.test(iv + tag + payload) ||
    payload.length % 2
  )
    throw Error("Invalid ciphertext");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex"),
  );
  cipher.setAuthTag(Buffer.from(tag, "hex"));
  return Buffer.concat([
    cipher.update(Buffer.from(payload, "hex")),
    cipher.final(),
  ]).toString("utf8");
}
