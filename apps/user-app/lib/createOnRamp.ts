"use server";

import { randomUUID } from "node:crypto";

import { prisma } from "@repo/db/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "./auth";

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

  revalidatePath("/user");

  return {
    id: tx.id,
    token: tx.token,
    status: tx.status as CreateOnRampResult["status"],
  };
}
