import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const QUESTIONS_PER_GAME = 5;

function shuffleQuestions<T>(questions: T[]) {
  const shuffledQuestions = [...questions];

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[swapIndex]] = [
      shuffledQuestions[swapIndex],
      shuffledQuestions[index],
    ];
  }

  return shuffledQuestions;
}

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

    return NextResponse.json({
      data: shuffleQuestions(questions).slice(0, QUESTIONS_PER_GAME),
    });
  } catch (error) {
    console.error("Failed to fetch questions:", error);

    return NextResponse.json(
      { error: "Failed to fetch questions." },
      { status: 500 },
    );
  }
}
