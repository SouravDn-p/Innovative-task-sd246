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
    const { forceComplete, reason, refundRemaining } = body;

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Find task
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

    // Check if task can be completed
    if (task.status === "completed") {
      return NextResponse.json(
        { error: "Task is already completed" },
        { status: 400 }
      );
    }

    // Get task statistics
    const userTasks = await db
      .collection("userTasks")
      .find({ taskId: new ObjectId(taskId) })
      .toArray();

    const completedTasks = userTasks.filter(
      (ut) => ut.paymentReceivedStatus === "completed"
    ).length;

    const isNaturallyComplete = completedTasks >= task.limitCount;

    if (!isNaturallyComplete && !forceComplete) {
      return NextResponse.json(
        {
          error: `Task is not naturally complete. ${completedTasks}/${task.limitCount} completed. Use forceComplete option to manually complete.`,
          canForceComplete: true,
          progress: {
            completed: completedTasks,
            limit: task.limitCount,
            percentage: (completedTasks / task.limitCount) * 100,
          },
        },
        { status: 400 }
      );
    }

    // Calculate refund if applicable
    const creator = await db.collection("Users").findOne({ email: task.gmail });

    let refundAmount = 0;
    if (refundRemaining && creator && forceComplete) {
      const remainingSlots = task.limitCount - completedTasks;
      refundAmount = remainingSlots * task.advertiserCost;

      if (refundAmount > 0) {
        // Refund remaining amount to creator
        await db.collection("Users").updateOne(
          { email: task.gmail },
          {
            $inc: { walletBalance: refundAmount },
            $set: { updatedAt: new Date() },
          }
        );

        // Log refund transaction
        await db.collection("walletTransactions").insertOne({
          userEmail: task.gmail,
          userId: creator._id,
          type: "credit",
          amount: refundAmount,
          description: `Refund for incomplete task: ${task.title}`,
          reference: `TASK_REFUND_${taskId}`,
          balanceBefore: creator.walletBalance,
          balanceAfter: creator.walletBalance + refundAmount,
          adminEmail: token.email,
          adminAction: true,
          taskId: new ObjectId(taskId),
          createdAt: new Date(),
        });
      }
    }

    // Complete the task
    const result = await db.collection("tasks").updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          completedBy: token.email,
          completionReason:
            reason ||
            (isNaturallyComplete
              ? "Natural completion"
              : "Admin forced completion"),
          finalCompletedCount: completedTasks,
          refundAmount: refundAmount,
          forceCompleted: !isNaturallyComplete,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to complete task" },
        { status: 500 }
      );
    }

    // Update remaining active user tasks to completed
    await db.collection("userTasks").updateMany(
      {
        taskId: new ObjectId(taskId),
        status: { $in: ["active", "pending"] },
      },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Mark any pending submissions as expired
    await db.collection("taskSubmissions").updateMany(
      {
        taskId: new ObjectId(taskId),
        status: "pending",
      },
      {
        $set: {
          status: "expired",
          expiredAt: new Date(),
          expiredReason: "Task completed by admin",
          updatedAt: new Date(),
        },
      }
    );

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "complete_task",
      adminEmail: token.email,
      targetTaskId: taskId,
      details: {
        taskTitle: task.title,
        reason: reason || "",
        forceCompleted: !isNaturallyComplete,
        finalCompletedCount: completedTasks,
        targetLimit: task.limitCount,
        refundAmount: refundAmount,
        completionDate: new Date(),
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Task completed successfully",
      task: {
        id: taskId,
        title: task.title,
        status: "completed",
        completedAt: new Date(),
        finalCount: completedTasks,
        targetLimit: task.limitCount,
        refundAmount: refundAmount,
        forceCompleted: !isNaturallyComplete,
      },
    });
  } catch (error) {
    console.error("Admin complete task error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
