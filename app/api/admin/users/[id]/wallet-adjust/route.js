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
    const { type, amount, note, reference } = body;

    // Validate input
    if (!type || !["credit", "debit"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid transaction type. Must be 'credit' or 'debit'" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!note || note.trim() === "") {
      return NextResponse.json(
        { error: "Note/reason is required" },
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

    const currentBalance = user.walletBalance || 0;
    let newBalance;

    if (type === "credit") {
      newBalance = currentBalance + parseFloat(amount);
    } else {
      newBalance = currentBalance - parseFloat(amount);

      // Check if user has sufficient balance for debit
      if (newBalance < 0) {
        return NextResponse.json(
          {
            error: `Insufficient balance. Current balance: ₹${currentBalance.toFixed(
              2
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Create wallet transaction record
    const transaction = {
      userEmail: user.email,
      userId: user._id,
      type,
      amount: parseFloat(amount),
      description: note,
      reference: reference || `ADMIN_${type.toUpperCase()}_${Date.now()}`,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      adminEmail: token.email,
      adminAction: true,
      createdAt: new Date(),
    };

    // Insert transaction
    const transactionResult = await db
      .collection("walletTransactions")
      .insertOne(transaction);

    // Update user wallet balance
    const userUpdateResult = await db.collection("Users").updateOne(
      { email: user.email },
      {
        $set: {
          walletBalance: newBalance,
          updatedAt: new Date(),
        },
      }
    );

    if (userUpdateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update user balance" },
        { status: 500 }
      );
    }

    // Update total earnings if it's a credit
    if (type === "credit") {
      await db.collection("Users").updateOne(
        { email: user.email },
        {
          $inc: {
            totalEarn: parseFloat(amount),
          },
        }
      );
    }

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "wallet_adjust",
      adminEmail: token.email,
      targetUserEmail: user.email,
      targetUserId: user._id.toString(),
      details: {
        type,
        amount: parseFloat(amount),
        note,
        reference: transaction.reference,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: `Wallet ${type} successful`,
      transaction: {
        ...transaction,
        _id: transactionResult.insertedId.toString(),
      },
      newBalance,
      previousBalance: currentBalance,
    });
  } catch (error) {
    console.error("Admin wallet adjust error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
