import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const backgrounds = await prisma.backgroundImage.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ data: backgrounds });
  } catch (error) {
    console.error("Failed to fetch active background images:", error);

    return NextResponse.json(
      { error: "Failed to fetch background images." },
      { status: 500 },
    );
  }
}
