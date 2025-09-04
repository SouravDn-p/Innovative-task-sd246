import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

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
    const days = parseInt(searchParams.get("days") || "30");

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all tasks for this advertiser
    const tasks = await db
      .collection("tasks")
      .find({ gmail: token.email })
      .toArray();

    // Get all submissions for these tasks
    const taskIds = tasks.map((task) => task._id.toString());
    const submissions = await db
      .collection("userTasks")
      .find({
        taskId: { $in: taskIds },
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .toArray();

    // Calculate overview metrics
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(
      (task) => task.status === "approved"
    ).length;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(
      (sub) => sub.status === "completed"
    ).length;
    const rejectedSubmissions = submissions.filter(
      (sub) => sub.status === "rejected"
    ).length;

    // Calculate performance metrics
    const totalImpressions = completedSubmissions * 150; // Estimated
    const totalClicks = completedSubmissions * 15; // Estimated
    const ctr =
      totalImpressions > 0
        ? ((totalClicks / totalImpressions) * 100).toFixed(2)
        : 0;
    const conversionRate =
      totalClicks > 0
        ? ((completedSubmissions / totalClicks) * 100).toFixed(2)
        : 0;

    // Calculate financial metrics
    const totalSpent = tasks.reduce(
      (sum, task) => sum + (task.advertiserCost * task.completedCount || 0),
      0
    );
    const roas =
      totalSpent > 0
        ? ((completedSubmissions * 100) / totalSpent).toFixed(2)
        : 0;

    // Get daily performance data
    const dailyPerformance = {};
    submissions.forEach((submission) => {
      const date = new Date(submission.createdAt).toISOString().split("T")[0];
      if (!dailyPerformance[date]) {
        dailyPerformance[date] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          submissions: 0,
        };
      }
      dailyPerformance[date].submissions++;
      if (submission.status === "completed") {
        dailyPerformance[date].conversions++;
        dailyPerformance[date].impressions += 150; // Estimated
        dailyPerformance[date].clicks += 15; // Estimated
      }
    });

    // Get top performing campaigns
    const campaignPerformance = tasks
      .map((task) => {
        const taskSubmissions = submissions.filter(
          (sub) => sub.taskId === task._id.toString()
        );
        const completed = taskSubmissions.filter(
          (sub) => sub.status === "completed"
        ).length;
        const impressions = completed * 150;
        const clicks = completed * 15;
        const ctr =
          impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;
        const cost = task.advertiserCost * completed;
        const roas = cost > 0 ? ((completed * 100) / cost).toFixed(2) : 0;

        return {
          id: task._id.toString(),
          name: task.title,
          status: task.status,
          impressions,
          clicks,
          conversions: completed,
          ctr,
          cost: cost.toFixed(2),
          roas,
        };
      })
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 10); // Top 10 campaigns

    return NextResponse.json({
      overview: {
        totalTasks,
        activeTasks,
        completedTasks,
        totalSubmissions,
        completedSubmissions,
        rejectedSubmissions,
        totalImpressions,
        totalClicks,
        ctr: parseFloat(ctr),
        conversionRate: parseFloat(conversionRate),
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        roas: parseFloat(roas),
      },
      dailyPerformance,
      campaignPerformance,
    });
  } catch (error) {
    console.error("Advertiser analytics GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics information" },
      { status: 500 }
    );
  }
}
