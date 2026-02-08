import { prisma } from "@repo/db/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email?.trim() || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const existingUser = await prisma.user.findFirst({
          where: { email },
        });

        if (!existingUser?.password) return null;

        const valid = await compare(credentials.password, existingUser.password);
        if (!valid) return null;

        const selectedRole = (credentials.role ?? "user") as "user" | "merchant";
        const userRole = existingUser.role ?? "user";

        if (selectedRole === "merchant") {
          if (userRole !== "merchant") return null;
        } else {
          if (userRole === "merchant") return null;
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },


  callbacks: {
    async signIn({ user, account }) {
      // Google sign-in only allowed for users who already registered (exist in our DB).
      if (account?.provider === "google") {
        if (!user.email) return false;
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) return false;
      }
      return true;
    },
    async session({ token, session }) {
      if (session.user) {
        session.user.id = token.sub ?? "";

        const dbUser = session.user.email
          ? await prisma.user.findUnique({
              where: { email: session.user.email },
            })
          : null;

        if (dbUser && "role" in dbUser) {
          session.user.role = dbUser.role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};
