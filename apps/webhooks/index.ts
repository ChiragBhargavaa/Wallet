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

app.listen(6900, () => {
  console.log("Server running on port 6900");
});