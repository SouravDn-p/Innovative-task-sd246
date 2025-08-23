// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/lib/mongoClient";

export async function POST(req) {
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
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.collection("Users").insertOne({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random`,

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
    // updatedAt: new Date(),
  });

  return NextResponse.json(
    { message: "User registered successfully" },
    { status: 201 }
  );
}
