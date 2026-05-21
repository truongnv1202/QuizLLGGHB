import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type CheckAnswerPayload = {
  questionId?: unknown;
  answerId?: unknown;
};

export async function POST(request: Request) {
  let payload: CheckAnswerPayload;

  try {
    payload = (await request.json()) as CheckAnswerPayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (typeof payload.questionId !== "string") {
    return NextResponse.json(
      { error: "questionId is required." },
      { status: 400 },
    );
  }

  try {
    const question = await prisma.question.findUnique({
      where: {
        id: payload.questionId,
      },
      select: {
        explanation: true,
        answers: {
          select: {
            id: true,
            content: true,
            isCorrect: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 },
      );
    }

    const submittedAnswerId =
      typeof payload.answerId === "string" ? payload.answerId : null;
    const selectedAnswer = submittedAnswerId
      ? question.answers.find((answer) => answer.id === submittedAnswerId)
      : null;
    const correctAnswer = question.answers.find((answer) => answer.isCorrect);

    if (!correctAnswer) {
      return NextResponse.json(
        { error: "Correct answer not found." },
        { status: 404 },
      );
    }

    if (submittedAnswerId && !selectedAnswer) {
      return NextResponse.json(
        { error: "Answer not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        isCorrect: selectedAnswer?.isCorrect ?? false,
        correctAnswer: {
          id: correctAnswer.id,
          content: correctAnswer.content,
        },
        explanation: question.explanation,
      },
    });
  } catch (error) {
    console.error("Failed to check answer:", error);

    return NextResponse.json(
      { error: "Failed to check answer." },
      { status: 500 },
    );
  }
}
