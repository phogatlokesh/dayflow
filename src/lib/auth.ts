import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/lib/db";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          return null;
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          name: user.employeeId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as {
          id?: string;
          employeeId?: string;
          role?: UserRole;
        };

        token.sub = authUser.id ?? token.sub;
        (token as typeof token & { employeeId?: string }).employeeId = authUser.employeeId;
        (token as typeof token & { role?: UserRole }).role = authUser.role ?? UserRole.EMPLOYEE;
      }

      return token;
    },
    async session({ session, token }) {
      const typedToken = token as typeof token & { employeeId?: string; role?: UserRole };

      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.employeeId = typedToken.employeeId ?? "";
        session.user.role = typedToken.role ?? UserRole.EMPLOYEE;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
