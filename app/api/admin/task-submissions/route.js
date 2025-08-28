import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// GET all task submissions for admin
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
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const taskId = searchParams.get("taskId") || "";
    const userEmail = searchParams.get("userEmail") || "";
    const sortBy = searchParams.get("sortBy") || "submittedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Build filter
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (taskId) {
      filter.taskId = new ObjectId(taskId);
    }

    if (userEmail) {
      filter.userEmail = { $regex: userEmail, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { "taskDetails.title": { $regex: search, $options: "i" } },
        { note: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get total count
    const totalCount = await db
      .collection("taskSubmissions")
      .countDocuments(filter);

    // Get submissions with pagination
    const submissions = await db
      .collection("taskSubmissions")
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get additional data for each submission
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        // Get user details
        const user = await db
          .collection("Users")
          .findOne(
            { email: submission.userEmail },
            { projection: { password: 0, walletBalance: 0 } }
          );

        // Get task details
        const task = await db
          .collection("tasks")
          .findOne({ _id: submission.taskId });

        // Get user task status
        const userTask = await db.collection("userTasks").findOne({
          taskId: submission.taskId,
          userEmail: submission.userEmail,
        });

        return {
          ...submission,
          _id: submission._id.toString(),
          taskId: submission.taskId.toString(),
          user: user
            ? {
                name: user.name,
                email: user.email,
                image: user.image,
                kycStatus: user.kycStatus || "none",
                joinDate: user.createdAt,
              }
            : null,
          task: task
            ? {
                title: task.title,
                reward: task.rateToUser,
                category: task.type,
                status: task.status,
                creator: task.gmail,
              }
            : null,
          userTaskStatus: userTask?.status || "unknown",
          timeToSubmit:
            userTask?.submittedAt && userTask?.dateCreated
              ? Math.floor(
                  (new Date(userTask.submittedAt) -
                    new Date(userTask.dateCreated)) /
                    (1000 * 60 * 60)
                )
              : null,
        };
      })
    );

    // Calculate statistics
    const stats = await db
      .collection("taskSubmissions")
      .aggregate([
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            pendingSubmissions: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            approvedSubmissions: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            rejectedSubmissions: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
            totalRewards: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "approved"] },
                  "$taskDetails.reward",
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray();

    const statistics = stats[0] || {
      totalSubmissions: 0,
      pendingSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
      totalRewards: 0,
    };

    return NextResponse.json({
      submissions: enrichedSubmissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      statistics,
    });
  } catch (error) {
    console.error("Get task submissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task submissions" },
      { status: 500 }
    );
  }
}
