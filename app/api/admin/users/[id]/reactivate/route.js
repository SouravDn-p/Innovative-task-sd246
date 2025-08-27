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
    const {
      feeCollected = false,
      feeAmount = 49,
      paymentReference,
      note,
    } = body;

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

    if (!user.isSuspended) {
      return NextResponse.json(
        { error: "User is not suspended" },
        { status: 400 }
      );
    }

    const reactivationDate = new Date();

    // Prepare reactivation record
    const reactivationRecord = {
      date: reactivationDate,
      reactivatedBy: token.email,
      feeCollected,
      feeAmount: feeCollected ? feeAmount : 0,
      paymentReference: paymentReference || null,
      note: note || null,
    };

    // Update user document
    const updateFields = {
      isSuspended: false,
      suspendedReason: null,
      suspensionAt: null,
      suspensionEndDate: null,
      reactivatedAt: reactivationDate,
      updatedAt: new Date(),
    };

    const result = await db.collection("Users").updateOne(
      { email: user.email },
      {
        $set: updateFields,
        $push: { reactivationHistory: reactivationRecord },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to reactivate user" },
        { status: 500 }
      );
    }

    // Create wallet transaction if fee was collected
    if (feeCollected && feeAmount > 0) {
      await db.collection("walletTransactions").insertOne({
        userEmail: user.email,
        userId: user._id,
        type: "debit",
        amount: feeAmount,
        description: "Account reactivation fee",
        reference: paymentReference || `REACTIVATION_${Date.now()}`,
        balanceBefore: user.walletBalance || 0,
        balanceAfter: (user.walletBalance || 0) - feeAmount,
        adminEmail: token.email,
        createdAt: new Date(),
      });

      // Update user wallet balance
      await db
        .collection("Users")
        .updateOne(
          { email: user.email },
          { $set: { walletBalance: (user.walletBalance || 0) - feeAmount } }
        );
    }

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "reactivate_user",
      adminEmail: token.email,
      targetUserEmail: user.email,
      targetUserId: user._id.toString(),
      details: {
        feeCollected,
        feeAmount: feeCollected ? feeAmount : 0,
        paymentReference,
        note,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "User reactivated successfully",
      reactivationDetails: {
        reactivatedAt: reactivationDate,
        feeCollected,
        feeAmount: feeCollected ? feeAmount : 0,
        paymentReference,
      },
    });
  } catch (error) {
    console.error("Admin reactivate user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
