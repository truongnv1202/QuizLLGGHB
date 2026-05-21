import { prisma } from "@/lib/prisma";

const GLOBAL_STATS_ID = "global";

export async function getGameStats() {
  return prisma.gameStats.upsert({
    where: {
      id: GLOBAL_STATS_ID,
    },
    update: {},
    create: {
      id: GLOBAL_STATS_ID,
    },
  });
}

export async function incrementTotalPlayers() {
  return prisma.gameStats.upsert({
    where: {
      id: GLOBAL_STATS_ID,
    },
    update: {
      totalPlayers: {
        increment: 1,
      },
    },
    create: {
      id: GLOBAL_STATS_ID,
      totalPlayers: 1,
    },
  });
}

export async function resetTotalPlayers() {
  return prisma.gameStats.upsert({
    where: {
      id: GLOBAL_STATS_ID,
    },
    update: {
      totalPlayers: 0,
    },
    create: {
      id: GLOBAL_STATS_ID,
      totalPlayers: 0,
    },
  });
}
