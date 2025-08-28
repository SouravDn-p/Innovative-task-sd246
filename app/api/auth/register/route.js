import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/lib/mongoClient";
import { sanitizeInput, validateEmail, validatePhone, safeNumber } from "@/lib/utils";

export async function POST(req) {
  try {
    const { name, email, password, phone, role } = await req.json();

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone format if provided
    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone format" },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedPhone = phone ? sanitizeInput(phone) : null;

    const db = client.db("TaskEarnDB");
    const userExists = await db.collection("Users").findOne({ email: sanitizedEmail });

    if (userExists) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    const newUser = {
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      password: hashedPassword,
      role: role === "advertiser" ? "advertiser" : "user",
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        sanitizedName
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
      totalEarn: 0,
      Recent_Referrals: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { insertedId } = await db.collection("Users").insertOne(newUser);

    // Return user data without sensitive information
    return NextResponse.json(
      {
        id: insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json(
      { 
        error: "Server error during registration",
        details: process.env.NODE_ENV === 'development' ? e.message : undefined
      },
      { status: 500 }
    );
  }
}
