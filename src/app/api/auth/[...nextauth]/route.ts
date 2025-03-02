
import NextAuth, { NextAuthOptions } from "next-auth"

import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { signInEmailPassword } from '@/auth/actions/auth-actions';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo electrónico", type: "email", placeholder: "usuario@google.com" },
        password: { label: "Contraseña", type: "password", placeholder: '******' }
      },
      async authorize(credentials) {
        const user = await signInEmailPassword(credentials!.email, credentials!.password);
        if (user)
          return user;


        return null;
      }
    }),
  ],

  session: {
    strategy: 'jwt'
  },

  callbacks: {

    // async signIn({ user, account, profile, email, credentials }) {
    //   console.log({ user, account, profile, email, credentials });
    //   return true;
    // },

    async jwt({ token }) {

      // console.log({ token, user, account, profile });
      const dbUser = await prisma.user.findUnique({ where: { email: token.email ?? 'no-email' } });
      if (!dbUser || dbUser?.isActive === false) {
        throw Error('Usuario no está activo');
      }

      token.roles = dbUser.roles;
      token.id = dbUser.id;

      return token;
    },

    async session({ session, token }) {

      // console.log({ session, token });
      if (session && session.user) {
        session.user.roles = token.roles;
        session.user.id = token.id;
      }

      return session;
    }

  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };