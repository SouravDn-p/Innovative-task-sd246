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

    const { referrerId, newUser } = await req.json();
    if (!referrerId || !newUser) {
      return new Response(
        JSON.stringify({ message: "referrerId and newUser data required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const users = db.collection("Users");

    // Find referrer
    const referrer = await users.findOne({ _id: new ObjectId(referrerId) });
    if (!referrer) {
      return new Response(JSON.stringify({ message: "Referrer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add 50 to walletBalance
    const incrementAmount = 50;

    // Prepare referral entry
    const referralEntry = {
      name: newUser.name || "Unknown",
      email: newUser.email || "no-email",
      joinDate: new Date().toISOString(),
      status: "Active",
      earned: `₹${incrementAmount}`,
    };

    // Update referrer wallet and referrals
    await users.updateOne(
      { _id: referrer._id },
      {
        $inc: { walletBalance: incrementAmount },
        $push: { recentReferrals: referralEntry },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    const updatedReferrer = await users.findOne({ _id: referrer._id });

    return new Response(
      JSON.stringify({
        message: "Referral added successfully",
        referrer: {
          ...updatedReferrer,
          _id: updatedReferrer._id.toString(),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("POST Error (addReferral):", err);
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
