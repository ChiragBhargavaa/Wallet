"use server";

import { randomUUID } from "node:crypto";

import { prisma } from "@repo/db/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "./auth";

const PEER_TRANSFER_WEBHOOK_URL =
  process.env.PEER_TRANSFER_WEBHOOK_URL ?? "http://127.0.0.1:6900/peer-transfer-success";

async function settlePeerTransferLocally(token: string) {
  const row = await prisma.peerTransfer.findUnique({
    where: { token },
    select: { status: true, toUserId: true, amount: true },
  });

  if (!row || row.status !== "Processing") {
    return;
  }

  await prisma.$transaction([
    prisma.balance.upsert({
      where: { userId: row.toUserId },
      update: {
        amount: { increment: row.amount },
      },
      create: {
        userId: row.toUserId,
        amount: row.amount,
        locked: 0,
      },
    }),
    prisma.peerTransfer.update({
      where: { token },
      data: { status: "Success" },
    }),
  ]);
}

export type PeerUserSearchResult = {
  id: string;
  email: string;
  name: string | null;
};

export async function searchPeerUsers(query: string): Promise<PeerUserSearchResult[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized ! User is not logged in");
  }

  const q = query.trim();
  if (q.length < 2) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      role: "user",
      NOT: { id: session.user.id },
      email: { contains: q, mode: "insensitive" },
    },
    select: { id: true, email: true, name: true },
    orderBy: { email: "asc" },
    take: 10,
  });
}

export type InitiatePeerTransferResult = {
  id: number;
  token: string;
  status: "Success" | "Failure" | "Processing";
};

export async function initiatePeerTransfer(
  toUserId: string,
  amount: number
): Promise<InitiatePeerTransferResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized ! User is not logged in");
  }

  const fromUserId = session.user.id;
  if (toUserId === fromUserId) {
    throw new Error("You cannot transfer to yourself");
  }

  const amountInt = Math.round(amount);
  if (!Number.isFinite(amountInt) || amountInt <= 0) {
    throw new Error("Invalid amount");
  }

  const recipient = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true, role: true },
  });
  if (!recipient || recipient.role !== "user") {
    throw new Error("Recipient not found");
  }

  const token = randomUUID();

  const peerRow = await prisma.$transaction(async (tx) => {
    const senderBalance = await tx.balance.findUnique({
      where: { userId: fromUserId },
    });
    if (!senderBalance || senderBalance.amount < amountInt) {
      throw new Error("Insufficient balance");
    }

    await tx.balance.update({
      where: { userId: fromUserId },
      data: { amount: { decrement: amountInt } },
    });

    return tx.peerTransfer.create({
      data: {
        token,
        amount: amountInt,
        fromUserId,
        toUserId,
        status: "Processing",
        startTime: new Date(),
      },
    });
  });

  try {
    const response = await fetch(PEER_TRANSFER_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: peerRow.token,
        fromUserId,
        toUserId,
        amount: amountInt,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  } catch (error) {
    console.warn("Peer transfer webhook failed; settling locally", error);
    await settlePeerTransferLocally(peerRow.token);
  }

  revalidatePath("/user");

  const finalRow = await prisma.peerTransfer.findUnique({
    where: { token: peerRow.token },
    select: { status: true, id: true },
  });

  return {
    id: finalRow?.id ?? peerRow.id,
    token: peerRow.token,
    status: (finalRow?.status ?? peerRow.status) as InitiatePeerTransferResult["status"],
  };
}
