"use server";

import { prisma } from "@repo/db/client";

const STALE_PEER_TRANSFER_MINUTES = 10;

export async function reconcileStalePeerTransfers(userId: string) {
  const cutoff = new Date(Date.now() - STALE_PEER_TRANSFER_MINUTES * 60 * 1000);

  const stale = await prisma.peerTransfer.findMany({
    where: {
      status: "Processing",
      updatedAt: { lt: cutoff },
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    select: { id: true },
  });

  let refunded = 0;

  for (const { id } of stale) {
    try {
      await prisma.$transaction(async (tx) => {
        const current = await tx.peerTransfer.findUnique({
          where: { id },
        });
        if (!current || current.status !== "Processing") {
          return;
        }

        await tx.balance.update({
          where: { userId: current.fromUserId },
          data: { amount: { increment: current.amount } },
        });
        await tx.peerTransfer.update({
          where: { id: current.id },
          data: { status: "Failure" },
        });
      });
      refunded += 1;
    } catch (e) {
      console.error("reconcileStalePeerTransfers", e);
    }
  }

  return refunded;
}
