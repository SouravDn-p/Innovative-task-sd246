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

    // Find referrer by ObjectId (since that's what we use as referral ID)
    let referrer;
    if (ObjectId.isValid(referrerId)) {
      referrer = await users.findOne({ _id: new ObjectId(referrerId) });
    } else {
      return new Response(
        JSON.stringify({ message: "Invalid referrer ID format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!referrer) {
      return new Response(JSON.stringify({ message: "Referrer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the current user is already referred
    const currentUser = await users.findOne({
      email: token.email || newUser.email,
    });
    if (currentUser && currentUser.referrerId) {
      return new Response(
        JSON.stringify({ message: "User already has a referrer" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Determine KYC status dynamically
    let kycStatus = "Not Verified";
    let earnedAmount = "₹0";
    let referralDate = new Date().toISOString();

    // Check if user is already KYC verified
    if (currentUser && currentUser.kycStatus === "verified") {
      kycStatus = "Verified";
      earnedAmount = "₹49"; // Reward for already verified users
      // Set referralDate to when they were verified
      referralDate = currentUser.kycReviewedAt || new Date().toISOString();
    }

    // Prepare referral entry with dynamic KYC status
    const referralEntry = {
      name: newUser.name || currentUser?.name || "Unknown",
      email: newUser.email || currentUser?.email || "no-email",
      joinDate: new Date().toISOString(),
      referralDate: referralDate,
      status: currentUser?.isSuspended ? "Suspended" : "Active",
      kycStatus: kycStatus,
      earned: earnedAmount,
      referredUserId: currentUser?._id?.toString() || null, // Store the referred user's ID for later updates
    };

    // If user is already verified, process referral reward immediately
    if (currentUser && currentUser.kycStatus === "verified") {
      // Award Rs.49 to referrer immediately
      const referralReward = 49;

      // Update referrer's wallet and referral records
      await users.updateOne(
        { _id: referrer._id },
        {
          $push: {
            Recent_Referrals: {
              $each: [referralEntry],
              $slice: -10, // Keep only latest 10 referrals
            },
          },
          $inc: {
            walletBalance: referralReward,
            totalReferralsCount: 1,
            dailyReferralsCount: 1,
          }, // Increment all counts for new verified referral
          $set: { updatedAt: new Date().toISOString() },
        }
      );

      // Add transaction to wallet history
      await db.collection("walletTransactions").insertOne({
        userId: referrer._id,
        type: "credit",
        amount: referralReward,
        description: `Referral reward for ${
          newUser.name || currentUser?.name || "Unknown"
        }`,
        timestamp: new Date(),
      });
    } else {
      // Update referrer wallet and referrals (not yet verified)
      await users.updateOne(
        { _id: referrer._id },
        {
          $push: {
            Recent_Referrals: {
              $each: [referralEntry],
              $slice: -10, // Keep only latest 10 referrals
            },
          },
          $inc: { totalReferralsCount: 1 }, // Increment total referrals count
          $set: { updatedAt: new Date().toISOString() },
        }
      );
    }

    // Update the current user's record with referrerId
    const userEmail = token.email || newUser.email;
    if (userEmail) {
      await users.updateOne(
        { email: userEmail },
        {
          $set: {
            referrerId: referrer._id.toString(),
            updatedAt: new Date().toISOString(),
          },
        }
      );
    }

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
