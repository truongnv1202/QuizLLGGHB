import { NextResponse } from "next/server";

import { generateRewardCode, isUniqueConstraintError } from "@/lib/game";
import { prisma } from "@/lib/prisma";

const MAX_CODE_GENERATION_ATTEMPTS = 10;

export async function POST() {
  try {
    for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt += 1) {
      const code = generateRewardCode();

      try {
        const rewardCode = await prisma.rewardCode.create({
          data: {
            code,
          },
          select: {
            code: true,
            createdAt: true,
          },
        });

        return NextResponse.json({ data: rewardCode }, { status: 201 });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          continue;
        }

        throw error;
      }
    }

    return NextResponse.json(
      { error: "Failed to generate a unique reward code." },
      { status: 409 },
    );
  } catch (error) {
    console.error("Failed to create reward code:", error);

    return NextResponse.json(
      { error: "Failed to create reward code." },
      { status: 500 },
    );
  }
}
