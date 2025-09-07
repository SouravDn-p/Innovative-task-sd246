import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") || ""; // credit, debit, all
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const category = searchParams.get("category") || ""; // advertiser_payment, user_payout, kyc_payment, account_reactivation
    const revenuePeriod = searchParams.get("revenuePeriod") || ""; // monthly, weekly, all

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get all transactions for reference in calculations
    const allTransactions = await db
      .collection("walletTransactions")
      .find({})
      .toArray();

    // Build transaction filter for all transactions
    const transactionFilter = {};

    // Type filter
    if (type && type !== "all") {
      transactionFilter.type = type;
    }

    // Category filter based on business rules
    if (category && category !== "all") {
      switch (category) {
        case "advertiser_payment":
          // Advertiser payments are credits to the website
          transactionFilter.type = "debit"; // Advertiser payments are debits from advertiser wallet (credits to website)
          transactionFilter.description = {
            $regex: "Payment for approved task|Payment for task",
            $options: "i",
          };
          break;
        case "user_payout":
          // User payouts are debits from the website
          transactionFilter.type = "debit";
          transactionFilter.description = {
            $regex: "Withdrawal",
            $options: "i",
          };
          break;
        case "kyc_payment":
          // KYC payments have a specific split
          transactionFilter.description = {
            $regex: "KYC verification fee",
            $options: "i",
          };
          break;
        case "account_reactivation":
          // Account reactivation payments
          transactionFilter.description = {
            $regex: "Account reactivation fee",
            $options: "i",
          };
          break;
      }
    }

    // Search filter
    if (search) {
      transactionFilter.$or = [
        { description: { $regex: search, $options: "i" } },
        { reference: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { adminEmail: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      transactionFilter.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate)) {
          transactionFilter.createdAt.$gte = fromDate;
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo + "T23:59:59.999Z");
        if (!isNaN(toDate)) {
          transactionFilter.createdAt.$lte = toDate;
        }
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

    // Format transactions with proper categorization
    const formattedTransactions = transactions.map((transaction) => {
      // Determine transaction type based on business rules
      let transactionType = "unknown";

      if (
        transaction.description
          ?.toLowerCase()
          .includes("payment for approved task") ||
        transaction.description?.toLowerCase().includes("payment for task")
      ) {
        transactionType = "advertiser_payment";
      } else if (
        transaction.description?.toLowerCase().includes("withdrawal")
      ) {
        transactionType = "user_payout";
      } else if (
        transaction.description?.toLowerCase().includes("kyc verification fee")
      ) {
        transactionType = "kyc_payment";
      } else if (
        transaction.description
          ?.toLowerCase()
          .includes("account reactivation fee")
      ) {
        transactionType = "account_reactivation";
      } else if (
        transaction.description
          ?.toLowerCase()
          .includes("task completion reward")
      ) {
        transactionType = "user_reward";
      }

      // Calculate referrer cut for KYC payments
      let referrerCut = 0;
      if (transactionType === "kyc_payment") {
        // Check if there's a corresponding referrer reward transaction
        // to determine if the user had a referrer
        const hasReferrerReward = allTransactions.some(
          (t) =>
            t.description?.toLowerCase().includes("referral reward") &&
            t.description?.toLowerCase().includes("kyc verification") &&
            Math.abs(new Date(t.createdAt) - new Date(transaction.createdAt)) <
              60000 // Within 1 minute
        );

        // Rs.49 goes to referrer if user has referrer, otherwise 0
        referrerCut = transaction.amount === 99 && hasReferrerReward ? 49 : 0;
      }

      return {
        ...transaction,
        _id: transaction._id.toString(),
        userId: transaction.userId?.toString(),
        taskId: transaction.taskId?.toString(),
        submissionId: transaction.submissionId?.toString(),
        type: transactionType,
        referrerCut: referrerCut,
        websiteCredit:
          transactionType === "kyc_payment"
            ? transaction.amount === 99
              ? referrerCut > 0
                ? 50
                : 99
              : transaction.amount
            : transactionType === "account_reactivation"
            ? transaction.amount
            : transactionType === "advertiser_payment"
            ? transaction.amount
            : 0,
        websiteDebit:
          transactionType === "user_payout"
            ? transaction.amount
            : transactionType === "user_reward"
            ? transaction.amount
            : transactionType === "kyc_payment" && transaction.amount === 99
            ? referrerCut
            : 0,
        // Ensure createdAt is a valid date string
        createdAt:
          transaction.createdAt && !isNaN(new Date(transaction.createdAt))
            ? transaction.createdAt
            : new Date().toISOString(),
      };
    });

    // Calculate website net balance based on business rules
    // Website net balance = (all credits – all debits)
    // Credits: advertiser payments + account reactivation payments + kyc website portion (Rs.50 or full amount if no referrer)
    // Debits: user payouts + user rewards + kyc referrer portion (Rs.49 or 0 if no referrer)

    let totalWebsiteCredits = 0;
    let totalWebsiteDebits = 0;
    let totalCompanyRevenue = 0;

    // Calculate company revenue based on business rules
    // Revenue: kyc website portion (Rs.50 or full amount if no referrer) + account reactivation payments + platform fees from task creation
    let revenueStats = {
      kycRevenue: 0,
      reactivationRevenue: 0,
      taskPlatformFees: 0,
      totalRevenue: 0,
    };

    // Filter transactions for revenue calculation based on period
    const getPeriodFilter = (period) => {
      const now = new Date();
      let startDate = new Date(0); // Default to all time

      if (period === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === "weekly") {
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
      }

      return startDate && !isNaN(startDate) ? startDate : new Date(0);
    };

    const periodStartDate = getPeriodFilter(revenuePeriod);

    // Filter transactions for the selected period
    const periodTransactions = allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return !isNaN(transactionDate) && transactionDate >= periodStartDate;
    });

    // Calculate revenue for all time
    allTransactions.forEach((transaction) => {
      if (
        transaction.description
          ?.toLowerCase()
          .includes("payment for approved task") ||
        transaction.description?.toLowerCase().includes("payment for task")
      ) {
        // Advertiser payment for task creation - full amount credited to website
        totalWebsiteCredits += transaction.amount;

        // Calculate platform fee (20% of the advertiser cost)
        // Advertiser cost = total amount / 1.2 (since advertiserCost = rateToUser * 1.2)
        const advertiserCost = transaction.amount / 1.2;
        const platformFee = transaction.amount - advertiserCost;
        revenueStats.taskPlatformFees += platformFee;
      } else if (
        transaction.description
          ?.toLowerCase()
          .includes("account reactivation fee")
      ) {
        // Account reactivation - full amount is revenue and credited to website
        totalWebsiteCredits += transaction.amount;
        revenueStats.reactivationRevenue += transaction.amount;
      } else if (
        transaction.description?.toLowerCase().includes("kyc verification fee")
      ) {
        // KYC payment - Rs.50 credited to website (revenue) if user has referrer,
        // otherwise full amount (Rs.99) credited to website (revenue)
        // We need to check if this transaction has a corresponding referrer reward transaction
        // to determine if the user had a referrer
        let kycWebsiteCredit = transaction.amount;
        let kycReferrerDebit = 0;

        // Check if there's a corresponding referrer reward transaction
        const hasReferrerReward = allTransactions.some(
          (t) =>
            t.description?.toLowerCase().includes("referral reward") &&
            t.description?.toLowerCase().includes("kyc verification") &&
            Math.abs(new Date(t.createdAt) - new Date(transaction.createdAt)) <
              60000 // Within 1 minute
        );

        if (hasReferrerReward && transaction.amount === 99) {
          // User had a referrer, so Rs.50 to website, Rs.49 to referrer
          kycWebsiteCredit = 50;
          kycReferrerDebit = 49;
        }
        // If no referrer reward or different amount, full amount goes to website

        totalWebsiteCredits += kycWebsiteCredit;
        totalWebsiteDebits += kycReferrerDebit;
        revenueStats.kycRevenue += kycWebsiteCredit;
      } else if (
        transaction.description?.toLowerCase().includes("withdrawal")
      ) {
        // User payout - full amount debited from website
        totalWebsiteDebits += transaction.amount;
      } else if (
        transaction.description
          ?.toLowerCase()
          .includes("task completion reward")
      ) {
        // User reward for task completion - full amount debited from website
        totalWebsiteDebits += transaction.amount;
      }
    });

    // Calculate revenue for the selected period
    let periodRevenueStats = {
      kycRevenue: 0,
      reactivationRevenue: 0,
      taskPlatformFees: 0,
      totalRevenue: 0,
    };

    periodTransactions.forEach((transaction) => {
      if (
        transaction.description
          ?.toLowerCase()
          .includes("payment for approved task") ||
        transaction.description?.toLowerCase().includes("payment for task")
      ) {
        // Calculate platform fee (20% of the advertiser cost)
        const advertiserCost = transaction.amount / 1.2;
        const platformFee = transaction.amount - advertiserCost;
        periodRevenueStats.taskPlatformFees += platformFee;
      } else if (
        transaction.description
          ?.toLowerCase()
          .includes("account reactivation fee")
      ) {
        periodRevenueStats.reactivationRevenue += transaction.amount;
      } else if (
        transaction.description?.toLowerCase().includes("kyc verification fee")
      ) {
        // KYC payment - Rs.50 credited to website (revenue) if user has referrer,
        // otherwise full amount (Rs.99) credited to website (revenue)
        // We need to check if this transaction has a corresponding referrer reward transaction
        // to determine if the user had a referrer
        let kycWebsiteCredit = transaction.amount;

        // Check if there's a corresponding referrer reward transaction
        const hasReferrerReward = periodTransactions.some(
          (t) =>
            t.description?.toLowerCase().includes("referral reward") &&
            t.description?.toLowerCase().includes("kyc verification") &&
            Math.abs(new Date(t.createdAt) - new Date(transaction.createdAt)) <
              60000 // Within 1 minute
        );

        if (hasReferrerReward && transaction.amount === 99) {
          // User had a referrer, so Rs.50 to website
          kycWebsiteCredit = 50;
        }
        // If no referrer reward or different amount, full amount goes to website

        periodRevenueStats.kycRevenue += kycWebsiteCredit;
      }
    });

    // Calculate total revenues
    revenueStats.totalRevenue =
      revenueStats.kycRevenue +
      revenueStats.reactivationRevenue +
      revenueStats.taskPlatformFees;
    periodRevenueStats.totalRevenue =
      periodRevenueStats.kycRevenue +
      periodRevenueStats.reactivationRevenue +
      periodRevenueStats.taskPlatformFees;

    const netBalance = totalWebsiteCredits - totalWebsiteDebits;

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions,
        hasNext: page < Math.ceil(totalTransactions / limit),
        hasPrev: page > 1,
      },
      netBalance: netBalance,
      totalWebsiteCredits: totalWebsiteCredits,
      totalWebsiteDebits: totalWebsiteDebits,
      revenue: revenueStats,
      periodRevenue: periodRevenueStats,
      revenuePeriod: revenuePeriod,
    });
  } catch (error) {
    console.error("Admin payouts GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout information" },
      { status: 500 }
    );
  }
}
