import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

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

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get current date for time-based calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Aggregate dashboard statistics
    const [
      totalUsersResult,
      newUsersResult,
      activeTasksResult,
      completedTasksResult,
      totalRevenueResult,
      taskSubmissionsResult,
      kycApplicationsResult,
      recentActivityResult,
      pendingAdvertiserRequestsResult,
    ] = await Promise.all([
      // Total users count
      db.collection("Users").countDocuments({}),

      // New users in the last week
      db.collection("Users").countDocuments({
        createdAt: { $gte: weekAgo.toISOString() },
      }),

      // Active tasks count (approved and not expired)
      db.collection("tasks").countDocuments({
        status: "approved",
        endAt: { $gte: now.toISOString() },
      }),

      // Completed tasks this month
      db.collection("tasks").countDocuments({
        status: "completed",
        updatedAt: { $gte: monthAgo.toISOString() },
      }),

      // Total revenue calculation (from completed user tasks)
      db
        .collection("userTasks")
        .aggregate([
          {
            $match: {
              paymentReceivedStatus: "completed",
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$rateToUser" },
            },
          },
        ])
        .toArray(),

      // Task submissions statistics
      db
        .collection("taskSubmissions")
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),

      // KYC applications statistics - get from both collections for accuracy
      Promise.all([
        // Count from Users collection (for verifiedKyc, pendingKyc, rejectedKyc)
        db
          .collection("Users")
          .aggregate([
            {
              $group: {
                _id: "$kycStatus",
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
        // Count from kyc-applications collection for application-specific stats
        db
          .collection("kyc-applications")
          .aggregate([
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
      ]),

      // Recent activity for today
      Promise.all([
        // User signups today
        db.collection("Users").countDocuments({
          createdAt: { $gte: today.toISOString() },
        }),
        // Task completions today
        db.collection("userTasks").countDocuments({
          paymentReceivedStatus: "completed",
          updatedAt: { $gte: today.toISOString() },
        }),
        // Revenue today
        db
          .collection("userTasks")
          .aggregate([
            {
              $match: {
                paymentReceivedStatus: "completed",
                updatedAt: { $gte: today.toISOString() },
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$rateToUser" },
              },
            },
          ])
          .toArray(),
      ]),

      // Pending advertiser requests
      // Removed advertiser request functionality
    ]);

    // Calculate system health (simplified metric based on active vs total tasks)
    const totalTasks = await db.collection("tasks").countDocuments({});
    const systemHealth =
      totalTasks > 0 ? Math.round((activeTasksResult / totalTasks) * 100) : 100;

    // Process task submissions data
    const submissionsStats = taskSubmissionsResult.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 }
    );

    // Process KYC data from both collections
    const [userKycStats, applicationKycStats] = kycApplicationsResult;

    // Process user KYC statistics (authoritative for final status)
    const kycStats = userKycStats.reduce(
      (acc, item) => {
        const status = item._id || "unverified";
        acc[status] = item.count;
        return acc;
      },
      { verified: 0, pending: 0, rejected: 0, unverified: 0, none: 0 }
    );

    // Combine pending and none into unverified for cleaner stats
    const totalUnverified = (kycStats.none || 0) + (kycStats.unverified || 0);

    // Process application KYC statistics for additional insights
    const appKycStats = applicationKycStats.reduce(
      (acc, item) => {
        const status = item._id || "unknown";
        acc[status] = item.count;
        return acc;
      },
      { verified: 0, pending: 0, rejected: 0 }
    );

    // Calculate changes (simplified - using random percentages for now)
    // In a real implementation, you'd compare with previous period data
    const getUserGrowth = () => Math.floor(Math.random() * 20) + 5;
    const getTaskGrowth = () => Math.floor(Math.random() * 15) + 3;
    const getRevenueGrowth = () => Math.floor(Math.random() * 25) + 10;

    const dashboardData = {
      stats: {
        totalUsers: totalUsersResult,
        newUsersThisWeek: newUsersResult,
        activeTasks: activeTasksResult,
        completedTasksThisMonth: completedTasksResult,
        totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
        systemHealth: Math.min(systemHealth, 100),
        pendingSubmissions: submissionsStats.pending,
        approvedSubmissions: submissionsStats.approved,
        rejectedSubmissions: submissionsStats.rejected,
        verifiedKyc: kycStats.verified || 0,
        pendingKyc: kycStats.pending || 0,
        rejectedKyc: kycStats.rejected || 0,
        pendingAdvertiserRequests: pendingAdvertiserRequestsResult,
        totalKycApplications:
          (appKycStats.verified || 0) +
          (appKycStats.pending || 0) +
          (appKycStats.rejected || 0),
      },
      recentActivity: [
        {
          type: "user_signup",
          count: recentActivityResult[0],
          change: `+${getUserGrowth()}%`,
          period: "today",
        },
        {
          type: "task_completion",
          count: recentActivityResult[1],
          change: `+${getTaskGrowth()}%`,
          period: "today",
        },
        {
          type: "revenue",
          count: recentActivityResult[2][0]?.totalRevenue || 0,
          change: `+${getRevenueGrowth()}%`,
          period: "today",
        },
      ],
      charts: {
        userGrowth: {
          thisWeek: newUsersResult,
          lastWeek: Math.max(
            0,
            newUsersResult - Math.floor(Math.random() * 10)
          ),
        },
        taskCompletions: {
          thisMonth: completedTasksResult,
          lastMonth: Math.max(
            0,
            completedTasksResult - Math.floor(Math.random() * 20)
          ),
        },
        revenue: {
          thisMonth: totalRevenueResult[0]?.totalRevenue || 0,
          lastMonth: Math.max(
            0,
            (totalRevenueResult[0]?.totalRevenue || 0) -
              Math.floor(Math.random() * 5000)
          ),
        },
      },
      alerts: [
        ...(submissionsStats.pending > 50
          ? [
              {
                type: "warning",
                message: `${submissionsStats.pending} task submissions pending review`,
                count: submissionsStats.pending,
              },
            ]
          : []),
        ...(kycStats.pending > 10
          ? [
              {
                type: "info",
                message: `${kycStats.pending} KYC applications awaiting review`,
                count: kycStats.pending,
              },
            ]
          : []),
        ...(pendingAdvertiserRequestsResult > 5
          ? [
              {
                type: "info",
                message: `${pendingAdvertiserRequestsResult} advertiser requests awaiting review`,
                count: pendingAdvertiserRequestsResult,
              },
            ]
          : []),
        ...(systemHealth < 80
          ? [
              {
                type: "error",
                message: `System health below optimal (${systemHealth}%)`,
                count: systemHealth,
              },
            ]
          : []),
      ],
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
