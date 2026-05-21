import { NextResponse } from "next/server";

import { getGameStats, incrementTotalPlayers } from "@/lib/game-stats";

export async function GET() {
  try {
    const stats = await getGameStats();

    return NextResponse.json({
      data: {
        totalPlayers: stats.totalPlayers,
      },
    });
  } catch (error) {
    console.error("Failed to fetch total players:", error);

    return NextResponse.json(
      { error: "Failed to fetch total players." },
      { status: 500 },
    );
  }
}

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
