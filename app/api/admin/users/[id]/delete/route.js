import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function DELETE(req, context) {
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
    const { reason, confirmDelete } = body;

    if (!confirmDelete) {
      return NextResponse.json(
        { error: "Delete confirmation is required" },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Deletion reason is required" },
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

    // Prevent deletion of admin users
    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 403 }
      );
    }

    // Check if user has active tasks or pending payouts
    const activeTasks = await db.collection("userTasks").countDocuments({
      userEmail: user.email,
      status: { $in: ["active", "pending"] },
    });

    const pendingPayouts = await db.collection("withdrawals").countDocuments({
      userEmail: user.email,
      status: "pending",
    });

    if (activeTasks > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete user with ${activeTasks} active tasks. Please complete or cancel tasks first.`,
        },
        { status: 400 }
      );
    }

    if (pendingPayouts > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete user with ${pendingPayouts} pending payouts. Please process payouts first.`,
        },
        { status: 400 }
      );
    }

    // Create deletion record before deleting user
    const deletionRecord = {
      deletedUser: {
        ...user,
        _id: user._id.toString(),
      },
      deletedBy: token.email,
      deletionReason: reason,
      deletedAt: new Date(),
    };

    await db.collection("deletedUsers").insertOne(deletionRecord);

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "delete_user",
      adminEmail: token.email,
      targetUserEmail: user.email,
      targetUserId: user._id.toString(),
      details: {
        reason,
        userRole: user.role,
        walletBalance: user.walletBalance || 0,
        totalEarnings: user.totalEarn || 0,
      },
      timestamp: new Date(),
    });

    // Delete related data
    const deletionPromises = [
      // Delete user document
      db.collection("Users").deleteOne({ _id: user._id }),

      // Delete user tasks
      db.collection("userTasks").deleteMany({ userEmail: user.email }),

      // Delete task submissions
      db.collection("taskSubmissions").deleteMany({ userEmail: user.email }),

      // Delete wallet transactions
      db.collection("walletTransactions").deleteMany({ userEmail: user.email }),

      // Update referrals (remove referrer reference)
      db
        .collection("Users")
        .updateMany(
          { referrerId: user.referralId },
          { $unset: { referrerId: "" } }
        ),
    ];

    await Promise.all(deletionPromises);

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        deletedAt: new Date(),
        reason,
      },
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
