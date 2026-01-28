import { prisma } from "@repo/db/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().max(255).optional(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "merchant"]).default("user"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        password: hashedPassword,
        role: role === "merchant" ? "MERCHANT" : "USER",
      },
    });

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 }
    );
  } catch (err) {
    // Log the real error so you can see it in the terminal (fixes 500 debugging)
    console.error("[POST /api/auth/register]", err);
    const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", _debug: process.env.NODE_ENV === "development" ? message : undefined },
      { status: 500 }
    );
  }
}
