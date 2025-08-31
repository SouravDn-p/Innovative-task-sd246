import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { safeNumber, formatCurrency, sanitizeInput } from "@/lib/utils";

// GET user wallet information and transaction history
export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a regular user or admin
    if (token.role !== "user" && token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: User access required" },
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

    // Get user information
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

    // Get task-related earning statistics
    const taskStats = await db
      .collection("userTasks")
      .aggregate([
        { $match: { userEmail: token.email } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            totalEarned: { $sum: "$earnedAmount" },
            completedTasks: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            pendingTasks: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            activeTasks: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();

    const taskStatistics = taskStats[0] || {
      totalTasks: 0,
      totalEarned: 0,
      completedTasks: 0,
      pendingTasks: 0,
      activeTasks: 0,
    };

    // Get monthly earning data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await db
      .collection("walletTransactions")
      .aggregate([
        {
          $match: {
            userEmail: token.email,
            type: "credit",
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalEarned: { $sum: "$amount" },
            transactionCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray();

    return NextResponse.json({
      wallet: {
        balance: safeNumber(user.walletBalance),
        totalEarnings: safeNumber(user.totalEarn),
        totalSpent: safeNumber(statistics.totalDebits),
        totalCredits: safeNumber(statistics.totalCredits),
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
        netBalance:
          safeNumber(statistics.totalCredits) -
          safeNumber(statistics.totalDebits),
      },
      taskStatistics,
      monthlyEarnings: monthlyEarnings.map((month) => ({
        month: `${month._id.year}-${month._id.month
          .toString()
          .padStart(2, "0")}`,
        amount: safeNumber(month.totalEarned),
        transactions: month.transactionCount,
      })),
    });
  } catch (error) {
    console.error("User wallet GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet information" },
      { status: 500 }
    );
  }
}
