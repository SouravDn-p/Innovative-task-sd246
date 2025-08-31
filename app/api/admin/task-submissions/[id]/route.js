import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// GET single task submission details
export async function GET(req, { params }) {
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

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get submission details
    const submission = await db
      .collection("taskSubmissions")
      .findOne({ _id: new ObjectId(id) });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Get user details
    const user = await db
      .collection("Users")
      .findOne(
        { email: submission.userEmail },
        { projection: { password: 0 } }
      );

    // Get task details
    const task = await db
      .collection("tasks")
      .findOne({ _id: submission.taskId });

    // Get user task details
    const userTask = await db.collection("userTasks").findOne({
      taskId: submission.taskId,
      userEmail: submission.userEmail,
    });

    // Get user's other submissions (for pattern analysis)
    const userSubmissions = await db
      .collection("taskSubmissions")
      .find({ userEmail: submission.userEmail })
      .sort({ submittedAt: -1 })
      .limit(10)
      .toArray();

    const enrichedSubmission = {
      ...submission,
      _id: submission._id.toString(),
      taskId: submission.taskId.toString(),
      user: user
        ? {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            kycStatus: user.kycStatus || "none",
            walletBalance: user.walletBalance || 0,
            joinDate: user.createdAt,
            totalEarned: user.totalEarned || 0,
            tasksCompleted: user.tasksCompleted || 0,
          }
        : null,
      task: task
        ? {
            _id: task._id.toString(),
            title: task.title,
            description: task.description,
            reward: task.rateToUser,
            category: task.type,
            status: task.status,
            creator: task.gmail,
            requirements: task.proofRequirements,
            startAt: task.startAt,
            endAt: task.endAt,
          }
        : null,
      userTask: userTask
        ? {
            _id: userTask._id.toString(),
            dateJoined: userTask.dateCreated,
            status: userTask.status,
            payment: userTask.payment,
          }
        : null,
      userHistory: {
        totalSubmissions: userSubmissions.length,
        approvedSubmissions: userSubmissions.filter(
          (s) => s.status === "approved"
        ).length,
        rejectedSubmissions: userSubmissions.filter(
          (s) => s.status === "rejected"
        ).length,
        recentSubmissions: userSubmissions.slice(0, 5).map((s) => ({
          _id: s._id.toString(),
          taskTitle: s.taskDetails?.title || "Unknown",
          status: s.status,
          submittedAt: s.submittedAt,
          reward: s.taskDetails?.reward || 0,
        })),
      },
      timeToSubmit:
        userTask?.submittedAt && userTask?.dateCreated
          ? Math.floor(
              (new Date(userTask.submittedAt) -
                new Date(userTask.dateCreated)) /
                (1000 * 60 * 60)
            )
          : null,
    };

    return NextResponse.json({ submission: enrichedSubmission });
  } catch (error) {
    console.error("Get submission details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission details" },
      { status: 500 }
    );
  }
}

// POST approve or reject submission
export async function POST(req, { params }) {
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

    const { id } = params;
    const body = await req.json();
    const { action, feedback = "" } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get submission details
    const submission = await db
      .collection("taskSubmissions")
      .findOne({ _id: new ObjectId(id) });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.status !== "pending") {
      return NextResponse.json(
        { error: "Submission has already been reviewed" },
        { status: 409 }
      );
    }

    // Start transaction for atomic operations
    const session = client.startSession();
    let result;

    try {
      await session.withTransaction(async () => {
        // Update submission status
        await db.collection("taskSubmissions").updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: action === "approve" ? "approved" : "rejected",
              reviewedAt: new Date(),
              reviewedBy: token.email,
              reviewFeedback: feedback,
            },
          },
          { session }
        );

        // Update user task status
        const newUserTaskStatus =
          action === "approve" ? "completed" : "rejected";
        await db.collection("userTasks").updateOne(
          {
            taskId: submission.taskId,
            userEmail: submission.userEmail,
          },
          {
            $set: {
              status: newUserTaskStatus,
              reviewedAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { session }
        );

        // If approved, add money to user wallet
        if (action === "approve") {
          const reward = submission.taskDetails?.reward || 0;

          if (reward > 0) {
            // Update user wallet balance
            await db.collection("Users").updateOne(
              { email: submission.userEmail },
              {
                $inc: {
                  walletBalance: reward,
                  totalEarned: reward,
                  tasksCompleted: 1,
                  weeklyEarnAmount: reward, // Track weekly earnings for activity rules
                },
                $set: {
                  updatedAt: new Date(),
                },
              },
              { session }
            );

            // Create wallet transaction record
            await db.collection("walletTransactions").insertOne(
              {
                userEmail: submission.userEmail,
                type: "credit",
                amount: reward,
                source: "task_completion",
                description: `Task completion reward: ${
                  submission.taskDetails?.title || "Unknown Task"
                }`,
                taskId: submission.taskId,
                submissionId: new ObjectId(id),
                status: "completed",
                createdAt: new Date(),
                adminEmail: token.email,
              },
              { session }
            );

            // Update user task payment status
            await db.collection("userTasks").updateOne(
              {
                taskId: submission.taskId,
                userEmail: submission.userEmail,
              },
              {
                $set: {
                  paymentReceivedStatus: "completed",
                  paymentReceivedAt: new Date(),
                },
              },
              { session }
            );
          }
        }
      });

      result = {
        message: `Submission ${action}d successfully`,
        submission: {
          ...submission,
          _id: submission._id.toString(),
          status: action === "approve" ? "approved" : "rejected",
          reviewedAt: new Date(),
          reviewedBy: token.email,
          reviewFeedback: feedback,
        },
      };

      if (action === "approve") {
        result.walletUpdate = {
          amount: submission.taskDetails?.reward || 0,
          message: "User wallet updated successfully",
        };
      }
    } finally {
      await session.endSession();
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Failed to review submission" },
      { status: 500 }
    );
  }
}
