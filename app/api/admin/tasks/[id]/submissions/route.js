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

    const taskId = params.id;
    const body = await req.json();
    const { submissionIds, action, feedback, bulkReason } = body;

    if (
      !submissionIds ||
      !Array.isArray(submissionIds) ||
      submissionIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Submission IDs array is required" },
        { status: 400 }
      );
    }

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Validate task exists
    let task;
    if (ObjectId.isValid(taskId)) {
      task = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) });
    } else {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Find submissions
    const objectIds = submissionIds.map((id) => {
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid submission ID: ${id}`);
      }
      return new ObjectId(id);
    });

    const submissions = await db
      .collection("taskSubmissions")
      .find({
        _id: { $in: objectIds },
        taskId: new ObjectId(taskId),
      })
      .toArray();

    if (submissions.length !== submissionIds.length) {
      return NextResponse.json(
        { error: "Some submissions not found or don't belong to this task" },
        { status: 404 }
      );
    }

    // Check if submissions are in pending status
    const nonPendingSubmissions = submissions.filter(
      (sub) => sub.status !== "pending"
    );

    if (nonPendingSubmissions.length > 0) {
      return NextResponse.json(
        {
          error: `${nonPendingSubmissions.length} submissions are not in pending status`,
          nonPendingIds: nonPendingSubmissions.map((sub) => sub._id.toString()),
        },
        { status: 400 }
      );
    }

    const results = [];
    const userUpdates = new Map(); // Track user payment updates

    for (const submission of submissions) {
      try {
        // Update submission status
        const updateData = {
          status: action === "approve" ? "approved" : "rejected",
          reviewedAt: new Date(),
          reviewedBy: token.email,
          reviewFeedback: feedback || bulkReason || "",
          updatedAt: new Date(),
        };

        const submissionResult = await db
          .collection("taskSubmissions")
          .updateOne({ _id: submission._id }, { $set: updateData });

        if (submissionResult.modifiedCount === 0) {
          results.push({
            submissionId: submission._id.toString(),
            success: false,
            error: "Failed to update submission",
          });
          continue;
        }

        // If approved, handle payment
        if (action === "approve") {
          // Find corresponding user task
          const userTask = await db.collection("userTasks").findOne({
            taskId: new ObjectId(taskId),
            userEmail: submission.userEmail,
          });

          if (userTask && userTask.paymentReceivedStatus !== "completed") {
            // Update user task payment status
            await db.collection("userTasks").updateOne(
              { _id: userTask._id },
              {
                $set: {
                  paymentReceivedStatus: "completed",
                  paymentCompletedAt: new Date(),
                  approvedBy: token.email,
                  updatedAt: new Date(),
                },
              }
            );

            // Calculate and add payment to user wallet
            const paymentAmount = userTask.payment || task.rateToUser;

            if (!userUpdates.has(submission.userEmail)) {
              userUpdates.set(submission.userEmail, {
                totalPayment: 0,
                submissions: [],
              });
            }

            const userUpdate = userUpdates.get(submission.userEmail);
            userUpdate.totalPayment += paymentAmount;
            userUpdate.submissions.push({
              submissionId: submission._id.toString(),
              amount: paymentAmount,
            });

            // Log wallet transaction
            await db.collection("walletTransactions").insertOne({
              userEmail: submission.userEmail,
              type: "credit",
              amount: paymentAmount,
              description: `Payment for approved task: ${task.title}`,
              reference: `TASK_PAYMENT_${submission._id}`,
              taskId: new ObjectId(taskId),
              submissionId: submission._id,
              adminEmail: token.email,
              adminAction: true,
              createdAt: new Date(),
            });
          }
        }

        results.push({
          submissionId: submission._id.toString(),
          success: true,
          action: action,
          userEmail: submission.userEmail,
          paymentAmount: action === "approve" ? task.rateToUser || 0 : 0,
        });
      } catch (error) {
        results.push({
          submissionId: submission._id.toString(),
          success: false,
          error: error.message,
        });
      }
    }

    // Update user wallet balances
    for (const [userEmail, updateData] of userUpdates) {
      await db.collection("Users").updateOne(
        { email: userEmail },
        {
          $inc: {
            walletBalance: updateData.totalPayment,
            totalEarn: updateData.totalPayment,
          },
          $set: { updatedAt: new Date() },
        }
      );
    }

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: `bulk_${action}_submissions`,
      adminEmail: token.email,
      targetTaskId: taskId,
      details: {
        taskTitle: task.title,
        submissionCount: submissions.length,
        successfulReviews: results.filter((r) => r.success).length,
        failedReviews: results.filter((r) => !r.success).length,
        totalPayment: Array.from(userUpdates.values()).reduce(
          (sum, update) => sum + update.totalPayment,
          0
        ),
        feedback: feedback || bulkReason || "",
        reviewDate: new Date(),
      },
      timestamp: new Date(),
    });

    // Calculate summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const totalPayment = Array.from(userUpdates.values()).reduce(
      (sum, update) => sum + update.totalPayment,
      0
    );

    return NextResponse.json({
      message: `Bulk ${action} completed`,
      summary: {
        total: submissions.length,
        successful,
        failed,
        totalPayment: action === "approve" ? totalPayment : 0,
        affectedUsers: userUpdates.size,
      },
      results,
      userPayments: Object.fromEntries(userUpdates),
    });
  } catch (error) {
    console.error("Admin review submissions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET endpoint to fetch submissions for a specific task
export async function GET(req, context) {
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

    const taskId = params.id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Build filter
    const filter = { taskId: new ObjectId(taskId) };
    if (status) {
      filter.status = status;
    }

    // Get submissions with user data
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "Users",
          localField: "userEmail",
          foreignField: "email",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "userTasks",
          let: { taskId: "$taskId", userEmail: "$userEmail" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$taskId", "$$taskId"] },
                    { $eq: ["$userEmail", "$$userEmail"] },
                  ],
                },
              },
            },
          ],
          as: "userTask",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
          userTask: { $arrayElemAt: ["$userTask", 0] },
        },
      },
      { $sort: { submittedAt: -1 } },
      {
        $facet: {
          submissions: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await db
      .collection("taskSubmissions")
      .aggregate(pipeline)
      .toArray();

    const submissions = result[0].submissions.map((submission) => ({
      ...submission,
      _id: submission._id.toString(),
      user: submission.user
        ? {
            ...submission.user,
            _id: submission.user._id.toString(),
          }
        : null,
      userTask: submission.userTask
        ? {
            ...submission.userTask,
            _id: submission.userTask._id.toString(),
          }
        : null,
    }));

    const totalCount = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      submissions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit,
      },
    });
  } catch (error) {
    console.error("Admin get task submissions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
