import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { loginSchema } from '@/lib/validations/auth.schema';

// proxy.ts (Next.js 16's replacement for middleware.ts) runs on the Node.js
// runtime only, unlike the old edge-runtime middleware — so, unlike classic
// Auth.js + Prisma setups, we don't need a separate edge-safe auth config
// split from this full one. A single config works everywhere.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Auth.js requires JWT sessions when Credentials is the only configured
  // provider (it throws UnsupportedStrategy for database sessions in that
  // case) — this holds whenever Google OAuth isn't configured. The Prisma
  // adapter is still used to persist OAuth accounts when Google *is*
  // configured; only the session token itself is JWT-based.
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        // Return a minimal object — never the raw Prisma row — so the
        // password hash never ends up anywhere near the JWT.
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
    // Optional — the app works fully on Credentials alone. Only registered
    // if the env vars are present, so local dev without Google keys works.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : []),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        // Queried fresh on every session read (this callback runs on every
        // auth() call regardless of JWT vs database strategy), so this
        // never goes stale even though the token itself is cached.
        const profile = await prisma.profile.findUnique({
          where: { userId: token.id as string },
          select: { onboardingCompleted: true },
        });
        session.user.onboardingCompleted = profile?.onboardingCompleted ?? false;
      }
      return session;
    },
  },
});
