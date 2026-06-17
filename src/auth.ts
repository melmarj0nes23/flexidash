import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/crypto";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        
        const db = getDb();
        const user = await db.select().from(users).where(eq(users.email, credentials.email as string)).get();
        if (!user || !user.passwordHash) return null;
        
        const isValid = await verifyPassword(credentials.password as string, user.passwordHash);
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string | undefined;
        session.user.name = token.name as string | undefined;
      }
      return session;
    }
  }
});
