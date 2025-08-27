import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

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
    const { newPassword, sendNotification = true } = body;

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

    let password;
    let hashedPassword;

    if (newPassword) {
      // Use provided password
      password = newPassword;
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Generate random password
      password =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user password
    const result = await db.collection("Users").updateOne(
      { email: user.email },
      {
        $set: {
          password: hashedPassword,
          passwordResetAt: new Date(),
          passwordResetBy: token.email,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 500 }
      );
    }

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "reset_password",
      adminEmail: token.email,
      targetUserEmail: user.email,
      targetUserId: user._id.toString(),
      details: {
        passwordGenerated: !newPassword,
        sendNotification,
      },
      timestamp: new Date(),
    });

    // TODO: Send notification to user (email/SMS) if enabled
    if (sendNotification) {
      // Here you would integrate with your notification service
      console.log(
        `Password reset notification should be sent to ${user.email}`
      );
    }

    return NextResponse.json({
      message: "Password reset successfully",
      temporaryPassword: newPassword ? null : password, // Only return if generated
      passwordResetAt: new Date(),
      notificationSent: sendNotification,
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
