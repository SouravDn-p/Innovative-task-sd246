import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function POST(req, context) {
  try {
    const { params } = await context;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await req.json();
    const { reason, duration, customReason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Suspension reason is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Find user
    let user;
    if (ObjectId.isValid(userId)) {
      user = await db
        .collection("Users")
        .findOne({ _id: new ObjectId(userId) });
    } else {
      user = await db.collection("Users").findOne({ email: userId });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "User is already suspended" },
        { status: 400 }
      );
    }

    const suspensionDate = new Date();
    const suspensionReason = reason === "custom" ? customReason : reason;

    // Calculate suspension end date if duration is provided
    let suspensionEndDate = null;
    if (duration && duration !== "permanent") {
      const durationDays = parseInt(duration);
      suspensionEndDate = new Date(
        suspensionDate.getTime() + durationDays * 24 * 60 * 60 * 1000
      );
    }

    // Prepare suspension record
    const suspensionRecord = {
      date: suspensionDate,
      reason: suspensionReason,
      suspendedBy: token.email,
      duration: duration || "permanent",
      endDate: suspensionEndDate,
    };

    // Update user document
    const result = await db.collection("Users").updateOne(
      { email: user.email },
      {
        $set: {
          isSuspended: true,
          suspendedReason: suspensionReason,
          suspensionAt: suspensionDate,
          suspensionEndDate: suspensionEndDate,
          lastSuspensionCount: (user.lastSuspensionCount || 0) + 1,
          updatedAt: new Date(),
        },
        $push: {
          suspensionHistory: suspensionRecord,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to suspend user" },
        { status: 500 }
      );
    }

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "suspend_user",
      adminEmail: token.email,
      targetUserEmail: user.email,
      targetUserId: user._id.toString(),
      details: {
        reason: suspensionReason,
        duration: duration || "permanent",
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "User suspended successfully",
      suspensionDetails: {
        reason: suspensionReason,
        suspendedAt: suspensionDate,
        duration: duration || "permanent",
        endDate: suspensionEndDate,
      },
    });
  } catch (error) {
    console.error("Admin suspend user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
