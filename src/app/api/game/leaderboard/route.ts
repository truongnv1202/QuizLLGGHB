import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type LeaderboardPayload = {
  playerName?: unknown;
  score?: unknown;
  totalQuestions?: unknown;
  durationMs?: unknown;
};

function parsePositiveInteger(value: unknown) {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue >= 0 ? numberValue : null;
}

export async function GET() {
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      take: 20,
      orderBy: [{ score: "desc" }, { durationMs: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);

    return NextResponse.json(
      { error: "Failed to fetch leaderboard." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let payload: LeaderboardPayload;

  try {
    payload = (await request.json()) as LeaderboardPayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const score = parsePositiveInteger(payload.score);
  const totalQuestions = parsePositiveInteger(payload.totalQuestions);
  const durationMs = parsePositiveInteger(payload.durationMs);
  const playerName =
    typeof payload.playerName === "string" && payload.playerName.trim()
      ? payload.playerName.trim().slice(0, 80)
      : "Khách tham gia";

  if (score === null || totalQuestions === null || durationMs === null) {
    return NextResponse.json(
      { error: "score, totalQuestions and durationMs must be valid integers." },
      { status: 400 },
    );
  }

  try {
    const entry = await prisma.leaderboardEntry.create({
      data: {
        playerName,
        score,
        totalQuestions,
        durationMs,
      },
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    console.error("Failed to create leaderboard entry:", error);

    return NextResponse.json(
      { error: "Failed to save leaderboard entry." },
      { status: 500 },
    );
  }
}
