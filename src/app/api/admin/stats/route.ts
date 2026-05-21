import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getGameStats } from "@/lib/game-stats";

export async function GET() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const stats = await getGameStats();

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats." },
      { status: 500 },
    );
  }
}
