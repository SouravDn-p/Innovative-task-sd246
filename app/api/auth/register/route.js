// app/api/auth/register/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import {
  sanitizeInput,
  validateEmail,
  validatePhone,
  safeNumber,
} from "@/lib/utils";

// Handle GET requests (prevent form default behavior)
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(req) {
  try {
    const { name, email, password, phone, role, referrerId } = await req.json();

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
    const userExists = await db
      .collection("Users")
      .findOne({ email: sanitizedEmail });

    if (userExists) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    // Check if referrerId is provided in the request or use from localStorage
    let validReferrerId = null;
    if (referrerId) {
      // Validate the referrerId
      if (ObjectId.isValid(referrerId)) {
        const referrer = await db
          .collection("Users")
          .findOne({ _id: new ObjectId(referrerId) });
        if (referrer) {
          validReferrerId = referrerId;
        }
      }
    }

    // Use the provided role, or default to "user" if not provided
    const userRole =
      role && ["user", "advertiser"].includes(role) ? role : "user";

    const newUser = {
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      password: hashedPassword,
      role: userRole, // Use the validated role
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
      referrerId: validReferrerId, // Set referrerId if valid
      dailyReferralsCount: 0,
      totalReferralsCount: 0,
      weeklyEarnAmount: 0,
      walletBalance: 0,
      totalEarn: 0,
      Recent_Referrals: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { insertedId } = await db.collection("Users").insertOne(newUser);

    // If we have a valid referrer, update their referral records
    if (validReferrerId) {
      try {
        const referralEntry = {
          name: sanitizedName,
          email: sanitizedEmail,
          joinDate: new Date().toISOString(),
          referralDate: new Date().toISOString(),
          status: "Active",
          kycStatus: "Not Verified",
          earned: "₹0",
          referredUserId: insertedId.toString(),
        };

        await db.collection("Users").updateOne(
          { _id: new ObjectId(validReferrerId) },
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
        details: process.env.NODE_ENV === "development" ? e.message : undefined,
      },
      { status: 500 }
    );
  }
}