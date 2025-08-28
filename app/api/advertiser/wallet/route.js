import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// GET advertiser wallet information and transaction history
export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is advertiser or admin
    if (token.role !== "advertiser" && token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Advertiser access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") || ""; // credit, debit
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get user/advertiser information
    const user = await db
      .collection("Users")
      .findOne({ email: token.email }, { projection: { password: 0 } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build transaction filter
    const transactionFilter = { userEmail: token.email };

    if (type) {
      transactionFilter.type = type;
    }

    if (search) {
      transactionFilter.$or = [
        { description: { $regex: search, $options: "i" } },
        { reference: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      transactionFilter.createdAt = {};
      if (dateFrom) {
        transactionFilter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        transactionFilter.createdAt.$lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    // Get total transaction count
    const totalTransactions = await db
      .collection("walletTransactions")
      .countDocuments(transactionFilter);

    // Get transactions with pagination
    const transactions = await db
      .collection("walletTransactions")
      .find(transactionFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Format transactions
    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      _id: transaction._id.toString(),
      userId: transaction.userId?.toString(),
      taskId: transaction.taskId?.toString(),
      submissionId: transaction.submissionId?.toString(),
    }));

    // Get task-related spending statistics
    const taskStats = await db
      .collection("tasks")
      .aggregate([
        { $match: { gmail: token.email } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            totalSpent: { $sum: "$advertiserCost" },
            activeTasks: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            pendingTasks: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            completedTasks: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();

    const taskStatistics = taskStats[0] || {
      totalTasks: 0,
      totalSpent: 0,
      activeTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
    };

    // Get monthly spending data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await db
      .collection("walletTransactions")
      .aggregate([
        {
          $match: {
            userEmail: token.email,
            type: "debit",
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalSpent: { $sum: "$amount" },
            transactionCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray();

    // Calculate transaction statistics
    const transactionStats = await db
      .collection("walletTransactions")
      .aggregate([
        { $match: { userEmail: token.email } },
        {
          $group: {
            _id: null,
            totalCredits: {
              $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] },
            },
            totalDebits: {
              $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] },
            },
            creditCount: {
              $sum: { $cond: [{ $eq: ["$type", "credit"] }, 1, 0] },
            },
            debitCount: {
              $sum: { $cond: [{ $eq: ["$type", "debit"] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();

    const statistics = transactionStats[0] || {
      totalCredits: 0,
      totalDebits: 0,
      creditCount: 0,
      debitCount: 0,
    };

    return NextResponse.json({
      wallet: {
        balance: user.walletBalance || 0,
        totalEarnings: user.totalEarn || 0,
        totalSpent: statistics.totalDebits,
        totalCredits: statistics.totalCredits,
      },
      transactions: formattedTransactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions,
        hasNext: page < Math.ceil(totalTransactions / limit),
        hasPrev: page > 1,
      },
      statistics: {
        ...statistics,
        netBalance: statistics.totalCredits - statistics.totalDebits,
      },
      taskStatistics,
      monthlySpending: monthlySpending.map((month) => ({
        month: `${month._id.year}-${month._id.month
          .toString()
          .padStart(2, "0")}`,
        amount: month.totalSpent,
        transactions: month.transactionCount,
      })),
    });
  } catch (error) {
    console.error("Advertiser wallet GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet information" },
      { status: 500 }
    );
  }
}

// POST add funds to advertiser wallet (for demo purposes or admin actions)
export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is advertiser or admin
    if (token.role !== "advertiser" && token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Advertiser access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { amount, description, reference } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (amount > 100000) {
      return NextResponse.json(
        { error: "Amount cannot exceed ₹100,000 per transaction" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get current user
    const user = await db.collection("Users").findOne({ email: token.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentBalance = user.walletBalance || 0;
    const newBalance = currentBalance + parseFloat(amount);

    // Create transaction record
    const transaction = {
      userEmail: token.email,
      userId: user._id,
      type: "credit",
      amount: parseFloat(amount),
      description: description || "Wallet top-up",
      reference: reference || `TOPUP_${Date.now()}`,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      adminAction: false,
      createdAt: new Date(),
    };

    // Insert transaction
    const transactionResult = await db
      .collection("walletTransactions")
      .insertOne(transaction);

    // Update user wallet balance
    const userUpdateResult = await db.collection("Users").updateOne(
      { email: token.email },
      {
        $set: {
          walletBalance: newBalance,
          updatedAt: new Date(),
        },
      }
    );

    if (userUpdateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update wallet balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Funds added successfully",
      transaction: {
        ...transaction,
        _id: transactionResult.insertedId.toString(),
      },
      newBalance,
      previousBalance: currentBalance,
    });
  } catch (error) {
    console.error("Advertiser wallet POST error:", error);
    return NextResponse.json(
      { error: "Failed to add funds to wallet" },
      { status: 500 }
    );
  }
}
