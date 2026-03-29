"use server";

import { prisma } from "@repo/db/client";

const STALE_ONRAMP_MINUTES = 10;

export async function reconcileStaleOnRampTransactions(userId: string) {
  const cutoff = new Date(Date.now() - STALE_ONRAMP_MINUTES * 60 * 1000);

  const result = await prisma.onRampTransaction.updateMany({
    where: {
      userId,
      status: "Processing",
      updatedAt: {
        lt: cutoff,
      },
    },
    data: {
      status: "Failure",
    },
  });

  return result.count;
}
