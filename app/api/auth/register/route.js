import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/lib/mongoClient";

export async function POST(req) {
  try {
    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const db = client.db("TaskEarnDB");
    const userExists = await db.collection("Users").findOne({ email });

    if (userExists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: role === "advertiser" ? "advertiser" : "user",
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=random`,

      // profile/kyc defaults
      kycStatus: "none",
      kycPaidAt: null,
      kycReferenceId: null,
      isVerified: false,
      isSuspended: false,
      suspendedReason: null,
      suspensionAt: null,
      lastSuspensionCount: 0,
      signupBonusEligibleAt: null,
      referrerId: null,
      dailyReferralsCount: 0,
      weeklyEarnAmount: 0,
      walletBalance: 0,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { insertedId } = await db.collection("Users").insertOne(newUser);

    return NextResponse.json(
      {
        id: insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image,
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
