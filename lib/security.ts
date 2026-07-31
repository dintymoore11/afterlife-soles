import { cookies } from "next/headers";

const DEVICE_COOKIE = "als_device";
const ADMIN_COOKIE = "als_admin";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256(value: string) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export async function getOrCreateDeviceToken() {
  const jar = await cookies();
  let token = jar.get(DEVICE_COOKIE)?.value;
  if (!token) {
    token = crypto.randomUUID() + crypto.randomUUID();
    jar.set(DEVICE_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return token;
}

export async function setAdminSession() {
  const secret = process.env.DEVICE_TOKEN_SECRET;
  if (!secret) throw new Error("Missing DEVICE_TOKEN_SECRET");
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const payload = String(expires);
  const signature = await hmac(payload, secret);
  (await cookies()).set(ADMIN_COOKIE, `${payload}.${signature}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 });
}

export async function isAdminSession() {
  const secret = process.env.DEVICE_TOKEN_SECRET;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!secret || !value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return (await hmac(expires, secret)) === signature;
}

export function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i++) result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return result === 0;
}
