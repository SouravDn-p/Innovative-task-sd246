import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "Invalid task ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get the task
    const task = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(id) });

    if (!task) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user is authorized to view this task (advertiser who created it or admin)
    if (token.role !== "admin" && task.gmail !== token.email) {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get detailed analytics for this task
    const submissions = await db
      .collection("userTasks")
      .find({
        taskId: task._id.toString(),
      })
      .toArray();

    // Calculate analytics metrics
    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(
      (sub) => sub.status === "completed"
    ).length;
    const rejectedSubmissions = submissions.filter(
      (sub) => sub.status === "rejected"
    ).length;
    const pendingSubmissions = submissions.filter(
      (sub) => sub.status === "assigned"
    ).length;

    // Calculate conversion rates
    const completionRate =
      totalSubmissions > 0
        ? (completedSubmissions / totalSubmissions) * 100
        : 0;
    const rejectionRate =
      totalSubmissions > 0 ? (rejectedSubmissions / totalSubmissions) * 100 : 0;

    // Estimate impressions and clicks (these would come from actual tracking in a real system)
    const estimatedImpressions = completedSubmissions * 150; // Average 150 impressions per completion
    const estimatedClicks = completedSubmissions * 15; // Average 15 clicks per completion
    const ctr =
      estimatedImpressions > 0
        ? (estimatedClicks / estimatedImpressions) * 100
        : 0;

    // Calculate earnings and costs
    const totalCost = task.advertiserCost * completedSubmissions;
    const roas = totalCost > 0 ? (completedSubmissions * 100) / totalCost : 0; // Simplified ROAS

    // Format the analytics data
    const analyticsData = {
      taskId: task._id.toString(),
      taskTitle: task.title,
      createdAt: task.createdAt,
      status: task.status,
      totalSubmissions,
      completedSubmissions,
      rejectedSubmissions,
      pendingSubmissions,
      completionRate: completionRate.toFixed(2),
      rejectionRate: rejectionRate.toFixed(2),
      estimatedImpressions,
      estimatedClicks,
      ctr: ctr.toFixed(2),
      totalCost: totalCost.toFixed(2),
      roas: roas.toFixed(2),
      // Daily breakdown (simplified - in a real system this would be more detailed)
      dailyPerformance: submissions.reduce((acc, submission) => {
        const date = new Date(submission.assignedAt || submission.createdAt)
          .toISOString()
          .split("T")[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            submissions: 0,
            completions: 0,
            rejections: 0,
          };
        }
        acc[date].submissions++;
        if (submission.status === "completed") acc[date].completions++;
        if (submission.status === "rejected") acc[date].rejections++;
        return acc;
      }, {}),
    };

    return new Response(JSON.stringify(analyticsData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET Task Analytics Error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
