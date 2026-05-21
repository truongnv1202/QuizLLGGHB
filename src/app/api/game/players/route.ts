import { NextResponse } from "next/server";

import { incrementTotalPlayers } from "@/lib/game-stats";

export async function POST() {
  try {
    const stats = await incrementTotalPlayers();

    return NextResponse.json({
      data: {
        totalPlayers: stats.totalPlayers,
      },
    });
  } catch (error) {
    console.error("Failed to increment total players:", error);

    return NextResponse.json(
      { error: "Failed to register player." },
      { status: 500 },
    );
  }
}
