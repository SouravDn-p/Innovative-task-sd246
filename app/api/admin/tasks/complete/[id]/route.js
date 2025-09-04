import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "@/lib/utils";

export async function POST(req, { params }) {
  const session = await clientPromise.then((client) => client.startSession());

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { id: taskId } = await params;

    console.log(
      "[COMPLETE TASK] Starting completion process for task:",
      taskId
    );

    if (!token) {
      console.log("[COMPLETE TASK] Unauthorized: No token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      console.log("[COMPLETE TASK] Forbidden: User role is", token.role);
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { forceComplete, reason, refundRemaining } = body;

    console.log(
      "[COMPLETE TASK] Admin",
      token.email,
      "completing task",
      taskId,
      "with options:",
      { forceComplete, reason, refundRemaining }
    );

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Validate taskId format
    if (!isValidObjectId(taskId)) {
      console.log("[COMPLETE TASK] Invalid task ID format:", taskId);
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Start atomic transaction
    session.startTransaction();

    try {
      // Find task within transaction
      const task = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) }, { session });

      console.log(
        "[COMPLETE TASK] Found task:",
        task
          ? {
              id: task._id,
              title: task.title,
              status: task.status,
            }
          : "null"
      );

      if (!task) {
        console.log("[COMPLETE TASK] Task not found:", taskId);
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      // Check if task can be completed
      if (task.status === "completed") {
        console.log("[COMPLETE TASK] Task already completed:", taskId);
        return NextResponse.json(
          { error: "Task is already completed" },
          { status: 400 }
        );
      }

      if (task.status !== "approved" && !forceComplete) {
        console.log(
          "[COMPLETE TASK] Cannot complete task with status:",
          task.status
        );
        return NextResponse.json(
          {
            error: "Task must be approved before completion",
            currentStatus: task.status,
          },
          { status: 400 }
        );
      }

      // Handle refund if requested
      if (refundRemaining && task.paymentDone) {
        console.log("[COMPLETE TASK] Processing refund for remaining budget");

        // Calculate remaining budget
        const userTasks = await db
          .collection("userTasks")
          .find({
            taskId: new ObjectId(taskId),
            paymentReceivedStatus: "completed",
          })
          .toArray();

        const completedCount = userTasks.length;
        const totalBudget = task.advertiserCost * task.limitCount;
        const spentAmount = task.rateToUser * completedCount;
        const remainingAmount = totalBudget - spentAmount;

        if (remainingAmount > 0) {
          // Refund to advertiser
          const creator = await db
            .collection("Users")
            .findOne({ email: task.gmail }, { session });

          if (creator) {
            const newBalance = (creator.walletBalance || 0) + remainingAmount;

            // Update user wallet balance within transaction
            await db.collection("Users").updateOne(
              { email: task.gmail },
              {
                $set: {
                  walletBalance: newBalance,
                  updatedAt: new Date(),
                },
              },
              { session }
            );

            // Create wallet transaction record within transaction
            await db.collection("walletTransactions").insertOne(
              {
                userEmail: task.gmail,
                userId: creator._id,
                type: "credit",
                amount: remainingAmount,
                description: `Refund for completed task: ${task.title}`,
                reference: `TASK_COMPLETION_REFUND_${Date.now()}`,
                balanceBefore: creator.walletBalance || 0,
                balanceAfter: newBalance,
                taskTitle: task.title,
                adminAction: true,
                adminEmail: token.email,
                createdAt: new Date(),
              },
              { session }
            );

            console.log(
              "[COMPLETE TASK] Refund processed successfully. New balance:",
              newBalance
            );
          }
        }
      }

      // Update task status to completed within transaction
      console.log("[COMPLETE TASK] Updating task status to completed:", taskId);
      const taskUpdateResult = await db.collection("tasks").updateOne(
        { _id: new ObjectId(taskId) },
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
            completedBy: token.email,
            completionNote: reason || "",
            updatedAt: new Date(),
          },
        },
        { session }
      );

      console.log("[COMPLETE TASK] Database update result:", {
        acknowledged: taskUpdateResult.acknowledged,
        modifiedCount: taskUpdateResult.modifiedCount,
        matchedCount: taskUpdateResult.matchedCount,
        taskId: taskId,
      });

      if (taskUpdateResult.modifiedCount === 0) {
        throw new Error(
          "Failed to complete task - no changes made to database"
        );
      }

      // Update advertiser profile data when task is completed
      console.log(
        "[COMPLETE TASK] Updating advertiser profile data for:",
        task.gmail
      );

      // When task is completed, decrement activeTasks and increment completedTasks
      const advertiserUpdateResult = await db.collection("Users").updateOne(
        { email: task.gmail, role: "advertiser" },
        {
          $inc: {
            "advertiserProfile.activeTasks": -1,
            "advertiserProfile.completedTasks": 1,
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { session }
      );

      console.log("[COMPLETE TASK] Advertiser profile update result:", {
        acknowledged: advertiserUpdateResult.acknowledged,
        modifiedCount: advertiserUpdateResult.modifiedCount,
        matchedCount: advertiserUpdateResult.matchedCount,
      });

      // Log admin action within transaction
      await db.collection("adminActions").insertOne(
        {
          action: "complete_task",
          adminEmail: token.email,
          targetTaskId: taskId,
          details: {
            taskTitle: task.title,
            forceComplete: forceComplete || false,
            refundRemaining: refundRemaining || false,
            reason: reason || "",
            completionDate: new Date(),
          },
          timestamp: new Date(),
        },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

      console.log("[COMPLETE TASK] Task completed successfully:", taskId);

      return NextResponse.json({
        message: "Task completed successfully",
        task: {
          id: taskId,
          title: task.title,
          status: "completed",
          completedAt: new Date(),
        },
      });
    } catch (transactionError) {
      // Abort transaction on error
      await session.abortTransaction();
      throw transactionError;
    }
  } catch (error) {
    console.error("[COMPLETE TASK] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to complete task",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    // End session
    await session.endSession();
  }
}
