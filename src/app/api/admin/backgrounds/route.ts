import { NextResponse } from "next/server";

import {
  badRequest,
  parseOptionalBoolean,
  parseRequiredString,
  readJsonBody,
  serverError,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const backgrounds = await prisma.backgroundImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: backgrounds });
  } catch (error) {
    console.error("Failed to fetch admin background images:", error);

    return serverError("Failed to fetch background images.");
  }
}

export async function POST(request: Request) {
  const payload = await readJsonBody(request);

  if (!payload || typeof payload !== "object") {
    return badRequest("Request body must be valid JSON.");
  }

  const imageUrl = parseRequiredString("imageUrl" in payload ? payload.imageUrl : null);
  const isActive = parseOptionalBoolean(
    "isActive" in payload ? payload.isActive : undefined,
  );

  if (!imageUrl) {
    return badRequest("imageUrl is required.");
  }

  if (isActive === null) {
    return badRequest("isActive must be a boolean.");
  }

  try {
    const background = await prisma.backgroundImage.create({
      data: {
        imageUrl,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ data: background }, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin background image:", error);

    return serverError("Failed to create background image.");
  }
}
