import { NextResponse } from "next/server";

import {
  badRequest,
  notFound,
  parseRequiredString,
  readJsonBody,
  serverError,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;

  try {
    const question = await prisma.question.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!question) {
      return notFound("Question not found.");
    }

    const answers = await prisma.answer.findMany({
      where: {
        questionId: id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ data: answers });
  } catch (error) {
    console.error(`Failed to fetch answers for question ${id}:`, error);

    return serverError("Failed to fetch answers.");
  }
}

export async function POST(request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return badRequest("Request body must be valid JSON.");
  }

  const content = parseRequiredString("content" in payload ? payload.content : null);
  const isCorrect = "isCorrect" in payload ? payload.isCorrect : null;

  if (!content) {
    return badRequest("Answer content is required.");
  }

  if (typeof isCorrect !== "boolean") {
    return badRequest("isCorrect must be a boolean.");
  }

  try {
    const question = await prisma.question.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!question) {
      return notFound("Question not found.");
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        isCorrect,
        questionId: id,
      },
    });

    return NextResponse.json({ data: answer }, { status: 201 });
  } catch (error) {
    console.error(`Failed to create answer for question ${id}:`, error);

    return serverError("Failed to create answer.");
  }
}
