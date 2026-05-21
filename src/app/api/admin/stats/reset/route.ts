import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { resetTotalPlayers } from "@/lib/game-stats";

export async function POST() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const stats = await resetTotalPlayers();

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Failed to reset total players:", error);

    return NextResponse.json(
      { error: "Failed to reset total players." },
      { status: 500 },
    );
  }
}
