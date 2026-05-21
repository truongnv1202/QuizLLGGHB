import { NextResponse } from "next/server";

import { getGameStats } from "@/lib/game-stats";

export async function GET() {
  try {
    const stats = await getGameStats();

    return NextResponse.json({
      data: {
        totalPlayers: stats.totalPlayers,
      },
    });
  } catch (error) {
    console.error("Failed to fetch game stats:", error);

    return NextResponse.json(
      { error: "Failed to fetch game stats." },
      { status: 500 },
    );
  }
}
