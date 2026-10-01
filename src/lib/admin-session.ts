export const ADMIN_COOKIE = "marrakisse_admin";
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function sameText(left: string, right: string) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  const length = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

export function adminEnvReady() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
}

export async function passwordsMatch(input: string, expected: string) {
  if (!expected) return false;
  const digest = async (value: string) =>
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  const left = await digest(input);
  const right = await digest(expected);
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

export async function createSessionToken() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("Admin session is not configured.");
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + MAX_AGE_MS }))
  );
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function verifySessionToken(token: string | undefined) {
  const secret = process.env.ADMIN_SECRET;
  if (!token || !secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || token.split(".").length !== 2) return false;
  const expected = await hmac(payload, secret);
  if (!sameText(signature, expected)) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export const adminSessionMaxAge = MAX_AGE_MS / 1000;
