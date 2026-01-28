import { prisma } from "@repo/db/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const existingUser = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        if (!existingUser?.password) return null;

        const valid = await compare(credentials.password, existingUser.password);
        if (!valid) return null;

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name ?? undefined,
          role: existingUser.role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};
