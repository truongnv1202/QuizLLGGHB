import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const limit = rawLimit ? Number(rawLimit) : 100;

  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    return NextResponse.json(
      { error: "Limit must be an integer from 1 to 500." },
      { status: 400 },
    );
  }

  try {
    const rewardCodes = await prisma.rewardCode.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: rewardCodes });
  } catch (error) {
    console.error("Failed to fetch admin reward codes:", error);

    return NextResponse.json(
      { error: "Failed to fetch reward codes." },
      { status: 500 },
    );
  }
}
