// app/api/auth/[...nextauth]/route.js (or pages/api/auth/[...nextauth].js) - Modified to set role: null for new Google users

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import client from "@/lib/mongoClient";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "something@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const db = client.db("TaskEarnDB");
        const user = await db
          .collection("Users")
          .findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Invalid password");
        }

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
    async jwt({ token, user, account, profile, trigger, session }) {
      const db = client.db("TaskEarnDB");

      // Validate user exists in database on each JWT callback
      // This prevents deleted users from still having valid sessions
      if (token?.email) {
        const existingUser = await db.collection("Users").findOne({
          email: token.email,
        });

        // If user doesn't exist in DB, invalidate the token
        if (!existingUser) {
          throw new Error("User no longer exists");
        }

        // Ensure token role matches database role
        // This prevents role manipulation attacks where a user might change their role in the token
        token.id = existingUser._id.toString();
        token.role = existingUser.role || null;
        token.name = existingUser.name;
        token.email = existingUser.email;
        token.picture = existingUser.image || token.picture;
      }

      // Handle first-time OAuth users
      if (account?.provider === "google") {
        const email = user?.email || token.email;
        const name = user?.name || token.name;
        const image = user?.image || token.picture;

        if (email) {
          let existingUser = await db.collection("Users").findOne({ email });
          if (!existingUser) {
            // Check if there's a referrerId in the state parameter
            let referrerId = null;
            if (account?.state) {
              try {
                const state = JSON.parse(account.state);
                if (state?.referrerId) {
                  // Validate the referrerId
                  if (ObjectId.isValid(state.referrerId)) {
                    const referrer = await db.collection("Users").findOne({
                      _id: new ObjectId(state.referrerId),
                    });
                    if (referrer) {
                      referrerId = state.referrerId;
                    }
                  }
                }
              } catch (e) {
                console.error("Error parsing OAuth state:", e);
              }
            }

            const { insertedId } = await db.collection("Users").insertOne({
              name,
              email,
              image,
              role: null, // Set to null for new Google users so they must select a role
              kycStatus: "none",
              kycPaidAt: null,
              kycReferenceId: null,
              isVerified: false,
              isSuspended: false,
              suspendedReason: null,
              suspensionAt: null,
              lastSuspensionCount: 0,
              signupBonusEligibleAt: null,
              referrerId: referrerId, // Set referrerId if valid
              dailyReferralsCount: 0,
              weeklyEarnAmount: 0,
              walletBalance: 0,
              totalEarn: 0,
              Recent_Referrals: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            token.id = insertedId.toString();
            token.role = null; // Ensure role is null so user must select one

            // If we have a valid referrer, update their referral records
            if (referrerId) {
              try {
                const referralEntry = {
                  name: name,
                  email: email,
                  joinDate: new Date().toISOString(),
                  referralDate: new Date().toISOString(),
                  status: "Active",
                  kycStatus: "Not Verified",
                  earned: "₹0",
                  referredUserId: insertedId.toString(),
                };

                await db.collection("Users").updateOne(
                  { _id: new ObjectId(referrerId) },
                  {
                    $push: {
                      Recent_Referrals: {
                        $each: [referralEntry],
                        $slice: -10,
                      },
                    },
                    $inc: { totalReferralsCount: 1 },
                    $set: { updatedAt: new Date().toISOString() },
                  }
                );
              } catch (err) {
                console.error("Error updating referrer records:", err);
                // Don't fail the registration if referrer update fails
              }
            }
          } else {
            token.id = existingUser._id.toString();
            token.role = existingUser.role || null; // Keep existing role or null
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
      // Validate user exists in database on each session callback as well
      const db = client.db("TaskEarnDB");

      if (token?.email) {
        const existingUser = await db.collection("Users").findOne({
          email: token.email,
        });

        // If user doesn't exist in DB, invalidate the session
        if (!existingUser) {
          throw new Error("User no longer exists");
        }

        // Ensure session role matches database role
        // This prevents role manipulation attacks where a user might change their role in the token
        session.user.id = existingUser._id.toString();
        session.user.role = existingUser.role || null;
        session.user.name = existingUser.name;
        session.user.email = existingUser.email;
        session.user.image = existingUser.image || token.picture;
      } else {
        // Fallback to token data if no email in token (shouldn't happen in normal flow)
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
