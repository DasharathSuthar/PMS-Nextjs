import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import bcrypt from 'bcryptjs';
import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { type: 'text', label: 'Email' },
        password: { type: 'password', label: 'Password' },
        role: { type: 'text', label: 'Role' }, // 👈 added role
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password || !credentials.role) {
          throw new Error('Missing email, password or role');
        }

        // find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

        if (!user) throw new Error('User not found');

        // check password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) throw new Error('Incorrect password');

        // check role
        if (user.role !== credentials.role) {
          throw new Error('Invalid role selected'); // 👈 prevents fake admin login
        }

        await db
          .update(users)
          .set({
            loginCount: sql`${users.loginCount} + 1`,
            isOnline: true,
            lastLogin: new Date(),
          })
          .where(eq(users.id, user.id));

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id.toString();
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (!token?.id) return;

      await db
        .update(users)
        .set({
          isOnline: false,
          lastSeen: new Date(),
        })
        .where(eq(users.id, token.id));
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
