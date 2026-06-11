import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
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
    console.error("Failed to fetch questions:", error);

    return NextResponse.json(
      { error: "Failed to fetch questions." },
      { status: 500 },
    );
  }
}
