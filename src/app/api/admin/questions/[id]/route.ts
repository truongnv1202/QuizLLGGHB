import { NextResponse } from "next/server";

import {
  badRequest,
  notFound,
  parseLevelOrNull,
  parseOptionalString,
  parseRequiredString,
  readJsonBody,
  serverError,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const question = await prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        answers: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!question) {
      return notFound("Question not found.");
    }

    return NextResponse.json({ data: question });
  } catch (error) {
    console.error(`Failed to fetch admin question ${id}:`, error);

    return serverError("Failed to fetch question.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return badRequest("Request body must be valid JSON.");
  }

  const data: {
    content?: string;
    explanation?: string | null;
    imageUrl?: string | null;
    level?: number;
  } = {};

  if ("content" in payload) {
    const content = parseRequiredString(payload.content);

    if (!content) {
      return badRequest("Question content must be a non-empty string.");
    }

    data.content = content;
  }

  if ("explanation" in payload) {
    const explanation = parseOptionalString(payload.explanation);

    if (explanation === undefined) {
      return badRequest("explanation must be a string or null.");
    }

    data.explanation = explanation;
  }

  if ("imageUrl" in payload) {
    const imageUrl = parseOptionalString(payload.imageUrl);

    if (imageUrl === undefined) {
      return badRequest("imageUrl must be a string or null.");
    }

    data.imageUrl = imageUrl;
  }

  if ("level" in payload) {
    const level = parseLevelOrNull(payload.level);

    if (!level) {
      return badRequest("Level must be an integer from 1 to 5.");
    }

    data.level = level;
  }

  if (Object.keys(data).length === 0) {
    return badRequest("Provide at least one field to update.");
  }

  try {
    const existingQuestion = await prisma.question.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingQuestion) {
      return notFound("Question not found.");
    }

    const question = await prisma.question.update({
      where: {
        id,
      },
      data,
      include: {
        answers: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json({ data: question });
  } catch (error) {
    console.error(`Failed to update admin question ${id}:`, error);

    return serverError("Failed to update question.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const existingQuestion = await prisma.question.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingQuestion) {
      return notFound("Question not found.");
    }

    await prisma.question.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error(`Failed to delete admin question ${id}:`, error);

    return serverError("Failed to delete question.");
  }
}
