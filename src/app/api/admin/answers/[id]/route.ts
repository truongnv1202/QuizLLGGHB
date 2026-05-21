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
    const answer = await prisma.answer.findUnique({
      where: {
        id,
      },
    });

    if (!answer) {
      return notFound("Answer not found.");
    }

    return NextResponse.json({ data: answer });
  } catch (error) {
    console.error(`Failed to fetch admin answer ${id}:`, error);

    return serverError("Failed to fetch answer.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return badRequest("Request body must be valid JSON.");
  }

  const data: {
    content?: string;
    isCorrect?: boolean;
  } = {};

  if ("content" in payload) {
    const content = parseRequiredString(payload.content);

    if (!content) {
      return badRequest("Answer content must be a non-empty string.");
    }

    data.content = content;
  }

  if ("isCorrect" in payload) {
    if (typeof payload.isCorrect !== "boolean") {
      return badRequest("isCorrect must be a boolean.");
    }

    data.isCorrect = payload.isCorrect;
  }

  if (Object.keys(data).length === 0) {
    return badRequest("Provide at least one field to update.");
  }

  try {
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingAnswer) {
      return notFound("Answer not found.");
    }

    const answer = await prisma.answer.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json({ data: answer });
  } catch (error) {
    console.error(`Failed to update admin answer ${id}:`, error);

    return serverError("Failed to update answer.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;

  try {
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingAnswer) {
      return notFound("Answer not found.");
    }

    await prisma.answer.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error(`Failed to delete admin answer ${id}:`, error);

    return serverError("Failed to delete answer.");
  }
}
