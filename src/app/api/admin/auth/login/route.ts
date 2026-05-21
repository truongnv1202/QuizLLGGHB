import { NextResponse } from "next/server";

import {
  setAdminSessionCookie,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

type LoginPayload = {
  username?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof payload.username !== "string" ||
    typeof payload.password !== "string"
  ) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  if (!verifyAdminCredentials(payload.username, payload.password)) {
    return NextResponse.json(
      { error: "Invalid admin credentials." },
      { status: 401 },
    );
  }

  await setAdminSessionCookie();

  return NextResponse.json({ data: { authenticated: true } });
}
