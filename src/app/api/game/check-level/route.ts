import { NextResponse } from "next/server";

import { parseGameLevel } from "@/lib/game";
import { prisma } from "@/lib/prisma";

type AnswerSubmission = {
  questionId: string;
  answerId: string;
};

type CheckLevelPayload = {
  level?: unknown;
  answers?: unknown;
};

function isAnswerSubmission(value: unknown): value is AnswerSubmission {
  return (
    typeof value === "object" &&
    value !== null &&
    "questionId" in value &&
    "answerId" in value &&
    typeof value.questionId === "string" &&
    typeof value.answerId === "string"
  );
}

export async function POST(request: Request) {
  let payload: CheckLevelPayload;

  try {
    payload = (await request.json()) as CheckLevelPayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const level = parseGameLevel(payload.level);

  if (!level) {
    return NextResponse.json(
      { error: "Level must be an integer from 1 to 5." },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(payload.answers) ||
    !payload.answers.every(isAnswerSubmission)
  ) {
    return NextResponse.json(
      {
        error:
          "Answers must be an array of { questionId: string, answerId: string }.",
      },
      { status: 400 },
    );
  }

  try {
    const submittedAnswers = new Map(
      payload.answers.map((answer) => [answer.questionId, answer.answerId]),
    );

    const questions = await prisma.question.findMany({
      where: {
        level,
      },
      select: {
        id: true,
        answers: {
          where: {
            isCorrect: true,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this level." },
        { status: 404 },
      );
    }

    const correctCount = questions.reduce((score, question) => {
      const submittedAnswerId = submittedAnswers.get(question.id);
      const isCorrect = question.answers.some(
        (answer) => answer.id === submittedAnswerId,
      );

      return isCorrect ? score + 1 : score;
    }, 0);

    const totalQuestions = questions.length;
    const scoreRatio = correctCount / totalQuestions;
    const result = scoreRatio >= 0.8 ? "pass" : "fail";

    return NextResponse.json({
      result,
      correctCount,
      totalQuestions,
      scorePercent: Math.round(scoreRatio * 100),
    });
  } catch (error) {
    console.error(`Failed to check answers for level ${level}:`, error);

    return NextResponse.json(
      { error: "Failed to check level result." },
      { status: 500 },
    );
  }
}
