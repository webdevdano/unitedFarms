import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { dbConnect } from "./mongoose";
import User from "../models/User";

type LeanUser = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email.toLowerCase().trim() }).lean<LeanUser>();
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password as string);
        if (!valid) return null;

        return {
          id: String(user._id),
          email: user.email as string,
          name: user.name as string,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};