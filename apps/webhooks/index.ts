import express, { Request, Response } from "express";
import { prisma } from "@repo/db/client";

const app = express();

app.use(express.json());

app.post("/bank-test", async (req: Request, res: Response) => {
  try {

    const paymentData = {
      token: req.body.token,
      userId: req.body.userId,
      amount: req.body.amount
    };

    await prisma.balance.update({
      where: {
        userId: paymentData.userId
      },
      data: {
        amount: {
          increment: paymentData.amount
        }
      }
    });

    await prisma.onRampTransaction.update({
      where: {
        token: paymentData.token
      },
      data: {
        status: "Success"
      }
    });

    res.status(200).json({
      message: "captured"
    });

  } catch (e) {

    console.error(e);

    res.status(411).json({
      message: "Error while processing bank webhook"
    });

  }
});

app.listen(6900, () => {
  console.log("Server running on port 6900");
});