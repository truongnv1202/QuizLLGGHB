import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const entries = await prisma.leaderboardEntry.findMany({
      take: 100,
      orderBy: [{ score: "desc" }, { durationMs: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error("Failed to fetch admin leaderboard:", error);

    return NextResponse.json(
      { error: "Failed to fetch leaderboard." },
      { status: 500 },
    );
  }
}
