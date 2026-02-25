import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[auth] Missing email or password");
            return null;
          }

          const email = (credentials.email as string).toLowerCase().trim();

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.error("[auth] User not found:", email);
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.error("[auth] Invalid password for:", email);
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("[auth] Database/auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/ar/auth/login",
  },
  session: {
    strategy: "jwt",
  },
});
