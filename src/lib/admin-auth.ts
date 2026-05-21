import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "quiz_admin_session";
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "GGHB@2026";

function getAdminUsername() {
  return process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.POSTGRES_PASSWORD ??
    "quizllgghb-local-admin-secret"
  );
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminCredentials(username: string, password: string) {
  return (
    safeEqual(username, getAdminUsername()) &&
    safeEqual(password, getAdminPassword())
  );
}

export function createAdminSessionToken() {
  return createHmac("sha256", getSessionSecret())
    .update(getAdminUsername())
    .digest("hex");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return Boolean(
    sessionToken && safeEqual(sessionToken, createAdminSessionToken()),
  );
}

export async function requireAdmin() {
  if (await isAdminAuthenticated()) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
