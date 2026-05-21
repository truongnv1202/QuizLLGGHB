import { NextResponse } from "next/server";

import {
  badRequest,
  notFound,
  parseOptionalBoolean,
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
    const background = await prisma.backgroundImage.findUnique({
      where: {
        id,
      },
    });

    if (!background) {
      return notFound("Background image not found.");
    }

    return NextResponse.json({ data: background });
  } catch (error) {
    console.error(`Failed to fetch admin background image ${id}:`, error);

    return serverError("Failed to fetch background image.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return badRequest("Request body must be valid JSON.");
  }

  const data: {
    imageUrl?: string;
    isActive?: boolean;
  } = {};

  if ("imageUrl" in payload) {
    const imageUrl = parseRequiredString(payload.imageUrl);

    if (!imageUrl) {
      return badRequest("imageUrl must be a non-empty string.");
    }

    data.imageUrl = imageUrl;
  }

  if ("isActive" in payload) {
    const isActive = parseOptionalBoolean(payload.isActive);

    if (isActive === null || isActive === undefined) {
      return badRequest("isActive must be a boolean.");
    }

    data.isActive = isActive;
  }

  if (Object.keys(data).length === 0) {
    return badRequest("Provide at least one field to update.");
  }

  try {
    const existingBackground = await prisma.backgroundImage.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingBackground) {
      return notFound("Background image not found.");
    }

    const background = await prisma.backgroundImage.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json({ data: background });
  } catch (error) {
    console.error(`Failed to update admin background image ${id}:`, error);

    return serverError("Failed to update background image.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const existingBackground = await prisma.backgroundImage.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingBackground) {
      return notFound("Background image not found.");
    }

    await prisma.backgroundImage.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error(`Failed to delete admin background image ${id}:`, error);

    return serverError("Failed to delete background image.");
  }
}
