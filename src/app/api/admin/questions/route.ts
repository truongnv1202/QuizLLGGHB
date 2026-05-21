import { NextResponse } from "next/server";

import {
  badRequest,
  parseAnswerInputs,
  parseLevelOrNull,
  parseOptionalString,
  parseRequiredString,
  readJsonBody,
  serverError,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { searchParams } = new URL(request.url);
  const levelParam = searchParams.get("level");
  const level = levelParam ? parseLevelOrNull(levelParam) : undefined;

  if (levelParam && !level) {
    return badRequest("Level must be an integer from 1 to 5.");
  }

  try {
    const questions = await prisma.question.findMany({
      where: level ? { level } : undefined,
      orderBy: [{ level: "asc" }, { createdAt: "asc" }],
      include: {
        answers: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json({ data: questions });
  } catch (error) {
    console.error("Failed to fetch admin questions:", error);

    return serverError("Failed to fetch questions.");
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return badRequest("Request body must be valid JSON.");
  }

  const content = parseRequiredString("content" in payload ? payload.content : null);
  const level = parseLevelOrNull("level" in payload ? payload.level : null);
  const explanation = parseOptionalString(
    "explanation" in payload ? payload.explanation : undefined,
  );
  const imageUrl = parseOptionalString(
    "imageUrl" in payload ? payload.imageUrl : undefined,
  );
  const answers = parseAnswerInputs("answers" in payload ? payload.answers : undefined);

  if (!content) {
    return badRequest("Question content is required.");
  }

  if (!level) {
    return badRequest("Level must be an integer from 1 to 5.");
  }

  if (imageUrl === undefined) {
    return badRequest("imageUrl must be a string or null.");
  }

  if (explanation === undefined) {
    return badRequest("explanation must be a string or null.");
  }

  if (answers === null) {
    return badRequest(
      "Answers must be an array of { content: string, isCorrect: boolean }.",
    );
  }

  try {
    const question = await prisma.question.create({
      data: {
        content,
        explanation,
        level,
        imageUrl,
        answers: answers
          ? {
              create: answers,
            }
          : undefined,
      },
      include: {
        answers: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json({ data: question }, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin question:", error);

    return serverError("Failed to create question.");
  }
}
