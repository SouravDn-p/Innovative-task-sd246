import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import client from "@/lib/mongoClient";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "sourav@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = client.db("TaskEarnDB");
        const user = await db
          .collection("Users")
          .findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
          image:
            user.image ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              user.name || "User"
            )}`,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      const db = client.db("TaskEarnDB");

      // Handle first-time OAuth users
      if (account?.provider === "google") {
        const email = user?.email || token.email;
        const name = user?.name || token.name;
        const image = user?.image || token.picture;

        if (email) {
          let existingUser = await db.collection("Users").findOne({ email });
          if (!existingUser) {
            const { insertedId } = await db.collection("Users").insertOne({
              name,
              email,
              image,
              role: "user",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            token.id = insertedId.toString();
            token.role = "user";
          } else {
            token.id = existingUser._id.toString();
            token.role = existingUser.role || "user";
          }
          token.name = name || existingUser?.name;
          token.email = email || existingUser?.email;
          token.picture = image || existingUser?.image;
        }
      }

      // Handle Credentials login
      if (account?.provider === "credentials" && user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
