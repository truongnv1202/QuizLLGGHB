import { NextResponse } from "next/server";

import { parseGameLevel } from "@/lib/game";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    level: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { level: rawLevel } = await context.params;
  const level = parseGameLevel(rawLevel);

  if (!level) {
    return NextResponse.json(
      { error: "Level must be an integer from 1 to 5." },
      { status: 400 },
    );
  }

  try {
    const questions = await prisma.question.findMany({
      where: {
        level,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        level: true,
        answers: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    return NextResponse.json({ data: questions });
  } catch (error) {
    console.error(`Failed to fetch questions for level ${level}:`, error);

    return NextResponse.json(
      { error: "Failed to fetch questions." },
      { status: 500 },
    );
  }
}
