import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function POST(req, { params }) {
  const { referrerId } = params;
  const body = await req.json();
  const client = await clientPromise;
  const db = client.db("TaskEarnDB");
  const users = db.collection("Users");

  // Check if referrer exists
  const referrer = await users.findOne({ _id: referrerId });
  if (!referrer) {
    return NextResponse.json(
      { message: "Invalid referrer ID" },
      { status: 400 }
    );
  }

  // Wallet +50 and push to recentReferrals[]
  const newReferral = {
    name: body.name,
    email: body.email,
    joinDate: new Date(),
    status: "Active",
    earned: "₹50",
  };

  await users.updateOne(
    { _id: referrerId },
    {
      $inc: { walletBalance: 50 },
      $push: { recentReferrals: newReferral },
    }
  );

  const updatedReferrer = await users.findOne({ _id: referrerId });

  return NextResponse.json({
    message: "Referral added successfully",
    referrer: updatedReferrer,
  });
}
