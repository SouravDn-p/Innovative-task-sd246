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
    const { notes } = body;

    // Validate input
    if (!notes || notes.trim() === "") {
      return NextResponse.json(
        { error: "Rejection reason is required" },
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

    // Update wallet request status to rejected
    await db.collection("walletRequests").updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "rejected",
          rejectionReason: notes,
          rejectedAt: new Date(),
          rejectedBy: token.email,
          updatedAt: new Date(),
        },
      }
    );

    // Find the user
    const user = await db.collection("Users").findOne({ _id: request.userId });

    if (user) {
      // Create notification for user
      const notification = {
        type: "wallet_request_rejected",
        title: "Wallet Funding Request Rejected",
        message: `Your wallet funding request has been rejected. Reason: ${notes}`,
        userId: user._id,
        userEmail: user.email,
        relatedId: requestId,
        read: false,
        createdAt: new Date(),
      };

      await db.collection("notifications").insertOne(notification);
    }

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "wallet_request_reject",
      adminEmail: token.email,
      targetUserEmail: request.userEmail,
      targetUserId: request.userId.toString(),
      details: {
        requestId,
        notes,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Wallet request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting wallet request:", error);
    return NextResponse.json(
      { error: "Failed to reject wallet request" },
      { status: 500 }
    );
  }
}
