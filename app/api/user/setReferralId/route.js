import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const users = db.collection("Users");

    // Find current user
    const currentUser = await users.findOne({ email: token.email });
    if (!currentUser) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user already has a referral ID
    if (currentUser.referrerId) {
      return new Response(
        JSON.stringify({ message: "User already has a referral ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Set the user's own ID as their referral ID
    await users.updateOne(
      { email: token.email },
      {
        $set: {
          referrerId: currentUser._id.toString(),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    const updatedUser = await users.findOne({ email: token.email });

    return new Response(
      JSON.stringify({
        message: "Referral ID set successfully",
        user: {
          ...updatedUser,
          _id: updatedUser._id.toString(),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("POST Error (setReferralId):", err);
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
