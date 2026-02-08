import { prisma } from "@repo/db/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().max(255).optional().transform((v) => (v && v.trim() ? v.trim() : undefined)),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address").transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["user", "merchant"]).default("user"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        fieldErrors.email?.[0] ??
        fieldErrors.password?.[0] ??
        fieldErrors.name?.[0] ??
        fieldErrors.role?.[0] ??
        "Invalid input. Please check your details.";
      return NextResponse.json(
        { error: firstError, fieldErrors },
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
        name: name && name.trim() ? name.trim() : null,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully." , success: true },
      { status: 201 },
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
