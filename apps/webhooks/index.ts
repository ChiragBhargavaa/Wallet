import express, { Request, Response } from "express";
import { prisma } from "@repo/db/client";

const app = express();

app.use(express.json());

app.post("/bank-test", async (req: Request, res: Response) => {
  try {
    const paymentData = {
      token: String(req.body.token ?? ""),
      userId: String(req.body.userId ?? ""),
      amount: Number(req.body.amount),
    };

    if (!paymentData.token || !paymentData.userId || !Number.isFinite(paymentData.amount) || paymentData.amount <= 0) {
      return res.status(400).json({
        message: "Invalid webhook payload",
      });
    }

    const tx = await prisma.onRampTransaction.findUnique({
      where: {
        token: paymentData.token,
      },
      select: {
        userId: true,
        amount: true,
        status: true,
      },
    });

    if (!tx) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    if (tx.status === "Success") {
      return res.status(200).json({
        message: "Already processed",
      });
    }

    if (tx.userId !== paymentData.userId || tx.amount !== paymentData.amount) {
      return res.status(400).json({
        message: "Webhook payload does not match transaction",
      });
    }

    await prisma.$transaction([
      prisma.balance.upsert({
        where: {
          userId: paymentData.userId,
        },
        update: {
          amount: {
            increment: paymentData.amount,
          },
        },
        create: {
          userId: paymentData.userId,
          amount: paymentData.amount,
          locked: 0,
        },
      }),
      prisma.onRampTransaction.update({
        where: {
          token: paymentData.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    return res.status(200).json({
      message: "captured",
    });
  } catch (e) {
    console.error(e);

    return res.status(411).json({
      message: "Error while processing bank webhook",
    });
  }
});

app.post("/bank-failure", async (req: Request, res: Response) => {
  try {
    const token = String(req.body.token ?? "");
    if (!token) {
      return res.status(400).json({
        message: "Token is required",
      });
    }

    await prisma.onRampTransaction.update({
      where: {
        token,
      },
      data: {
        status: "Failure",
      }
    });

    return res.status(200).json({
      message: "failed",
    });
  } catch (e) {
    console.error(e);
    return res.status(411).json({
      message: "Error while processing failed webhook",
    });
  }
});

app.post("/peer-transfer-success", async (req: Request, res: Response) => {
  try {
    const payload = {
      token: String(req.body.token ?? ""),
      fromUserId: String(req.body.fromUserId ?? ""),
      toUserId: String(req.body.toUserId ?? ""),
      amount: Number(req.body.amount),
    };

    if (
      !payload.token ||
      !payload.fromUserId ||
      !payload.toUserId ||
      !Number.isFinite(payload.amount) ||
      payload.amount <= 0
    ) {
      return res.status(400).json({ message: "Invalid peer transfer webhook payload" });
    }

    const tx = await prisma.peerTransfer.findUnique({
      where: { token: payload.token },
      select: {
        fromUserId: true,
        toUserId: true,
        amount: true,
        status: true,
      },
    });

    if (!tx) {
      return res.status(404).json({ message: "Peer transfer not found" });
    }

    if (tx.status === "Success") {
      return res.status(200).json({ message: "Already processed" });
    }

    if (tx.status !== "Processing") {
      return res.status(400).json({ message: "Peer transfer not in processing state" });
    }

    if (
      tx.fromUserId !== payload.fromUserId ||
      tx.toUserId !== payload.toUserId ||
      tx.amount !== payload.amount
    ) {
      return res.status(400).json({ message: "Webhook payload does not match peer transfer" });
    }

    await prisma.$transaction([
      prisma.balance.upsert({
        where: { userId: payload.toUserId },
        update: { amount: { increment: payload.amount } },
        create: {
          userId: payload.toUserId,
          amount: payload.amount,
          locked: 0,
        },
      }),
      prisma.peerTransfer.update({
        where: { token: payload.token },
        data: { status: "Success" },
      }),
    ]);

    return res.status(200).json({ message: "peer transfer captured" });
  } catch (e) {
    console.error(e);
    return res.status(411).json({ message: "Error while processing peer transfer webhook" });
  }
});

app.post("/peer-transfer-failure", async (req: Request, res: Response) => {
  try {
    const token = String(req.body.token ?? "");
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const row = await prisma.peerTransfer.findUnique({
      where: { token },
      select: { id: true, status: true, fromUserId: true, amount: true },
    });

    if (!row) {
      return res.status(404).json({ message: "Peer transfer not found" });
    }

    if (row.status !== "Processing") {
      return res.status(200).json({ message: "Not in processing state" });
    }

    await prisma.$transaction([
      prisma.balance.update({
        where: { userId: row.fromUserId },
        data: { amount: { increment: row.amount } },
      }),
      prisma.peerTransfer.update({
        where: { token },
        data: { status: "Failure" },
      }),
    ]);

    return res.status(200).json({ message: "peer transfer failed and refunded" });
  } catch (e) {
    console.error(e);
    return res.status(411).json({ message: "Error while processing peer transfer failure webhook" });
  }
});

app.listen(6900, () => {
  console.log("Server running on port 6900");
});