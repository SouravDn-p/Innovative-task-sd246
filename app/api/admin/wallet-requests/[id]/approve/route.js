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

    const requestId = params.id;
    const body = await req.json();
    const { amount, notes } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Find the wallet request
    const request = await db
      .collection("walletRequests")
      .findOne({ _id: new ObjectId(requestId) });

    if (!request) {
      return NextResponse.json(
        { error: "Wallet request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.collection("Users").findOne({ _id: request.userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const amountToAdd = parseFloat(amount);
    const currentBalance = user.walletBalance || 0;
    const newBalance = currentBalance + amountToAdd;

    // Create wallet transaction record
    const transaction = {
      userEmail: user.email,
      userId: user._id,
      type: "credit",
      amount: amountToAdd,
      description: `Wallet funding request approved: ${request.description}`,
      reference: `WALLET_REQUEST_${requestId}`,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      adminEmail: token.email,
      adminAction: true,
      createdAt: new Date(),
    };

    // Insert transaction
    await db.collection("walletTransactions").insertOne(transaction);

    // Update user wallet balance
    await db.collection("Users").updateOne(
      { _id: user._id },
      {
        $set: {
          walletBalance: newBalance,
          updatedAt: new Date(),
        },
        $inc: {
          totalEarn: amountToAdd,
        },
      }
    );

    // Update wallet request status to approved
    await db.collection("walletRequests").updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "approved",
          adminNotes: notes || "",
          approvedAt: new Date(),
          approvedBy: token.email,
          updatedAt: new Date(),
        },
      }
    );

    // Create notification for user
    const notification = {
      type: "wallet_request_approved",
      title: "Wallet Funding Request Approved",
      message: `Your wallet funding request for ₹${amountToAdd.toFixed(
        2
      )} has been approved and funds added to your wallet.`,
      userId: user._id,
      userEmail: user.email,
      relatedId: requestId,
      read: false,
      createdAt: new Date(),
    };

    await db.collection("notifications").insertOne(notification);

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "wallet_request_approve",
      adminEmail: token.email,
      targetUserEmail: user.email,
      targetUserId: user._id.toString(),
      details: {
        requestId,
        amount: amountToAdd,
        notes: notes || "",
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Wallet request approved successfully",
      transaction,
      newBalance,
    });
  } catch (error) {
    console.error("Error approving wallet request:", error);
    return NextResponse.json(
      { error: "Failed to approve wallet request" },
      { status: 500 }
    );
  }
}
