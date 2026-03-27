"use server";

import { randomUUID } from "node:crypto";

import { prisma } from "@repo/db/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "./auth";

const BANK_WEBHOOK_URL = process.env.BANK_WEBHOOK_URL ?? "http://127.0.0.1:6900/bank-test";

async function settleOnRampLocally(token: string, userId: string, amount: number) {
  const existing = await prisma.onRampTransaction.findUnique({
    where: { token },
    select: { status: true },
  });

  if (!existing || existing.status === "Success") {
    return;
  }

  await prisma.$transaction([
    prisma.balance.upsert({
      where: { userId },
      update: {
        amount: {
          increment: amount,
        },
      },
      create: {
        userId,
        amount,
        locked: 0,
      },
    }),
    prisma.onRampTransaction.update({
      where: { token },
      data: { status: "Success" },
    }),
  ]);
}

export type CreateOnRampResult = {
  id: number;
  token: string;
  status: "Success" | "Failure" | "Processing";
};

export async function createOnRamp(
  amount: number,
  provider: string
): Promise<CreateOnRampResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized ! User is not logged in");
  }

  const amountInt = Math.round(amount);
  if (!Number.isFinite(amountInt) || amountInt <= 0) {
    throw new Error("Invalid amount");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const existingProcessing = await prisma.onRampTransaction.findFirst({
    where: {
      userId: user.id,
      provider,
      status: "Processing",
    },
    select: { id: true },
  });

  if (existingProcessing) {
    throw new Error(
      `A ${provider} payment is already processing. Please wait until it completes.`
    );
  }

  const token = randomUUID();

  const tx = await prisma.onRampTransaction.create({
    data: {
      amount: amountInt,
      provider,
      userId: user.id,
      token,
      status: "Processing",
      startTime: new Date(),
    },
  });

  // Simulate bank callback after creating on-ramp transaction.
  try {
    const response = await fetch(BANK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: tx.token,
        userId: user.id,
        amount: amountInt,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  } catch (error) {
    console.warn("Webhook trigger failed; settling transaction locally", error);
    await settleOnRampLocally(tx.token, user.id, amountInt);
  }

  revalidatePath("/user");

  return {
    id: tx.id,
    token: tx.token,
    status: tx.status as CreateOnRampResult["status"],
  };
}
