import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { TOTP } from 'otplib';
import prisma from './prisma';

const totp = new TOTP();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
    CredentialsProvider({
      id: 'totp',
      name: 'TOTP',
      credentials: {
        uid: { label: 'User ID', type: 'text' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.uid || !credentials?.code) return null;
        const user = await prisma.user.findUnique({ where: { id: credentials.uid } });
        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) return null;
        const isValid = totp.verify(credentials.code, { secret: user.twoFactorSecret });
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          twoFactorEnabled: true,
          totpVerified: true,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET })]
      : []),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || 'client';
        token.id = user.id;
        token.twoFactorEnabled = (user as any).twoFactorEnabled || false;
        if ((user as any).totpVerified) {
          token.totpVerified = true;
        }
      }
      if (account && account.provider === 'google') {
        // Auto-create user if signing in with Google for the first time
        const existing = await prisma.user.findUnique({ where: { email: token.email! } });
        if (!existing) {
          const created = await prisma.user.create({
            data: { email: token.email!, name: token.name, image: token.picture, role: 'client' },
          });
          token.id = created.id;
          token.role = 'client';
        } else {
          token.id = existing.id;
          token.role = existing.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).twoFactorEnabled = token.twoFactorEnabled || false;
        (session.user as any).totpVerified = token.totpVerified || false;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const passwordHash = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'client',
    },
  });
}
