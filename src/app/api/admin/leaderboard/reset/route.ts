import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const result = await prisma.leaderboardEntry.deleteMany();

    return NextResponse.json({ data: { deletedCount: result.count } });
  } catch (error) {
    console.error("Failed to reset leaderboard:", error);

    return NextResponse.json(
      { error: "Failed to reset leaderboard." },
      { status: 500 },
    );
  }
}
