import { randomInt } from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const QUESTIONS_PER_GAME = 5;
const RECENT_QUESTION_SET_LIMIT = 8;
const RECENT_QUESTION_SETS_COOKIE = "quiz-recent-question-sets";
const MAX_RANDOM_ATTEMPTS = 80;

function shuffleQuestions<T>(questions: T[]) {
  const shuffledQuestions = [...questions];

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffledQuestions[index], shuffledQuestions[swapIndex]] = [
      shuffledQuestions[swapIndex],
      shuffledQuestions[index],
    ];
  }

  return shuffledQuestions;
}

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return cookie.slice(name.length + 1);
}

function parseRecentQuestionSets(cookieHeader: string | null) {
  const encodedValue = readCookie(cookieHeader, RECENT_QUESTION_SETS_COOKIE);

  if (!encodedValue) {
    return [];
  }

  try {
    const jsonValue = Buffer.from(encodedValue, "base64url").toString("utf8");
    const parsedValue = JSON.parse(jsonValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((item): item is string => typeof item === "string")
      .slice(0, RECENT_QUESTION_SET_LIMIT);
  } catch {
    return [];
  }
}

function encodeRecentQuestionSets(questionSets: string[]) {
  return Buffer.from(JSON.stringify(questionSets), "utf8").toString(
    "base64url",
  );
}

function getQuestionSetSignature(questions: Array<{ id: string }>) {
  return questions
    .map((question) => question.id)
    .sort()
    .join(".");
}

function selectQuestionSet<T extends { id: string }>(
  questions: T[],
  recentQuestionSets: string[],
) {
  const recentSet = new Set(recentQuestionSets);
  let selectedQuestions = shuffleQuestions(questions).slice(
    0,
    QUESTIONS_PER_GAME,
  );

  if (questions.length <= QUESTIONS_PER_GAME) {
    return selectedQuestions;
  }

  for (let attempt = 0; attempt < MAX_RANDOM_ATTEMPTS; attempt += 1) {
    const candidateQuestions = shuffleQuestions(questions).slice(
      0,
      QUESTIONS_PER_GAME,
    );
    const candidateSignature = getQuestionSetSignature(candidateQuestions);

    if (!recentSet.has(candidateSignature)) {
      return candidateQuestions;
    }

    selectedQuestions = candidateQuestions;
  }

  return selectedQuestions;
}

export async function GET(request: Request) {
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
    const recentQuestionSets = parseRecentQuestionSets(
      request.headers.get("cookie"),
    );
    const selectedQuestions = selectQuestionSet(questions, recentQuestionSets);
    const selectedQuestionSetSignature =
      getQuestionSetSignature(selectedQuestions);
    const nextRecentQuestionSets = [
      selectedQuestionSetSignature,
      ...recentQuestionSets.filter(
        (signature) => signature !== selectedQuestionSetSignature,
      ),
    ].slice(0, RECENT_QUESTION_SET_LIMIT);

    const response = NextResponse.json({
      data: selectedQuestions,
    });

    response.cookies.set({
      name: RECENT_QUESTION_SETS_COOKIE,
      value: encodeRecentQuestionSets(nextRecentQuestionSets),
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Failed to fetch questions:", error);

    return NextResponse.json(
      { error: "Failed to fetch questions." },
      { status: 500 },
    );
  }
}
