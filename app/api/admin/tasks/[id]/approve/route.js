import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { safeNumber, formatCurrency, isValidObjectId } from "@/lib/utils";

export async function POST(req, { params }) {
  const session = await clientPromise.then((client) => client.startSession());

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Await params before using its properties
    const { id: taskId } = await params;
    console.log("[APPROVE TASK] Starting approval process for task:", taskId);

    if (!token) {
      console.log("[APPROVE TASK] Unauthorized: No token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      console.log("[APPROVE TASK] Forbidden: User role is", token.role);
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { note } = body;

    console.log(
      "[APPROVE TASK] Admin",
      token.email,
      "approving task",
      taskId,
      "with note:",
      note
    );

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Validate taskId format
    if (!isValidObjectId(taskId)) {
      console.log("[APPROVE TASK] Invalid task ID format:", taskId);
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
        "[APPROVE TASK] Found task:",
        task
          ? {
              id: task._id,
              title: task.title,
              status: task.status,
              paymentDone: task.paymentDone,
            }
          : "null"
      );

      if (!task) {
        console.log("[APPROVE TASK] Task not found:", taskId);
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      // Check if task can be approved
      if (task.status === "approved") {
        console.log("[APPROVE TASK] Task already approved:", taskId);
        return NextResponse.json(
          { error: "Task is already approved" },
          { status: 400 }
        );
      }

      if (task.status === "completed") {
        console.log("[APPROVE TASK] Cannot approve completed task:", taskId);
        return NextResponse.json(
          { error: "Cannot approve completed task" },
          { status: 400 }
        );
      }

      // Calculate total budget required for the task using safe number handling
      const advertiserCost = safeNumber(task.advertiserCost);
      const limitCount = safeNumber(task.limitCount);
      const totalBudgetRequired = advertiserCost * limitCount;

      console.log("[APPROVE TASK] Budget calculation:", {
        advertiserCost,
        limitCount,
        totalBudgetRequired,
        paymentDone: task.paymentDone,
      });

      // Always validate payment for approval, regardless of paymentDone status
      console.log("[APPROVE TASK] Validating payment for approval");
      const creator = await db
        .collection("Users")
        .findOne({ email: task.gmail }, { session });

      if (!creator) {
        console.log("[APPROVE TASK] Task creator not found:", task.gmail);
        return NextResponse.json(
          { error: "Task creator not found" },
          { status: 404 }
        );
      }

      const currentBalance = safeNumber(creator.walletBalance);
      console.log(
        "[APPROVE TASK] Creator wallet balance:",
        formatCurrency(currentBalance)
      );
      const hasPayment = currentBalance >= totalBudgetRequired;

      if (!hasPayment) {
        console.log("[APPROVE TASK] Insufficient wallet balance for approval");
        return NextResponse.json(
          {
            error: `Insufficient budget. Required: ₹${formatCurrency(
              totalBudgetRequired
            )}, Available: ₹${formatCurrency(currentBalance)}`,
            paymentRequired: true,
            budgetRequired: totalBudgetRequired,
            availableBalance: currentBalance,
            message: "Please add funds to your wallet before approval",
          },
          { status: 400 }
        );
      }

      // If payment wasn't done during creation, process it now
      if (!task.paymentDone) {
        console.log("[APPROVE TASK] Processing payment during approval");
        const newBalance = currentBalance - totalBudgetRequired;

        // Update user wallet balance within transaction
        const walletUpdateResult = await db.collection("Users").updateOne(
          { email: task.gmail },
          {
            $set: {
              walletBalance: newBalance,
              updatedAt: new Date(),
            },
          },
          { session }
        );

        if (walletUpdateResult.modifiedCount === 0) {
          throw new Error("Failed to update wallet balance");
        }

        // Create wallet transaction record within transaction
        await db.collection("walletTransactions").insertOne(
          {
            userEmail: task.gmail,
            userId: creator._id,
            type: "debit",
            amount: totalBudgetRequired,
            description: `Payment for approved task: ${task.title}`,
            reference: `TASK_APPROVAL_PAYMENT_${Date.now()}`,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            taskTitle: task.title,
            adminAction: true,
            adminEmail: token.email,
            createdAt: new Date(),
          },
          { session }
        );

        console.log(
          "[APPROVE TASK] Payment processed successfully. New balance:",
          formatCurrency(newBalance)
        );
      } else {
        console.log(
          "[APPROVE TASK] Payment already processed during task creation"
        );
      }

      // Update task status to approved within transaction
      console.log("[APPROVE TASK] Updating task status to approved:", taskId);
      const taskUpdateResult = await db.collection("tasks").updateOne(
        { _id: new ObjectId(taskId) },
        {
          $set: {
            status: "approved",
            approvedAt: new Date(),
            approvedBy: token.email,
            approvalNote: note || "",
            updatedAt: new Date(),
            paymentDone: true, // Always mark as paid after approval
          },
        },
        { session }
      );

      console.log("[APPROVE TASK] Database update result:", {
        acknowledged: taskUpdateResult.acknowledged,
        modifiedCount: taskUpdateResult.modifiedCount,
        matchedCount: taskUpdateResult.matchedCount,
        taskId: taskId,
      });

      if (taskUpdateResult.modifiedCount === 0) {
        throw new Error("Failed to approve task - no changes made to database");
      }

      // Update advertiser profile data
      console.log(
        "[APPROVE TASK] Updating advertiser profile data for:",
        task.gmail
      );
      const advertiserUpdateResult = await db.collection("Users").updateOne(
        { email: task.gmail, role: "advertiser" },
        {
          $inc: {
            "advertiserProfile.totalTasks": 1,
            "advertiserProfile.activeTasks": 1,
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { session }
      );

      console.log("[APPROVE TASK] Advertiser profile update result:", {
        acknowledged: advertiserUpdateResult.acknowledged,
        modifiedCount: advertiserUpdateResult.modifiedCount,
        matchedCount: advertiserUpdateResult.matchedCount,
      });

      // Log admin action within transaction
      await db.collection("adminActions").insertOne(
        {
          action: "approve_task",
          adminEmail: token.email,
          targetTaskId: taskId,
          details: {
            taskTitle: task.title,
            budgetLocked: totalBudgetRequired,
            note: note || "",
            approvalDate: new Date(),
          },
          timestamp: new Date(),
        },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

      console.log("[APPROVE TASK] Task approved successfully:", taskId);

      return NextResponse.json({
        message: "Task approved successfully",
        task: {
          id: taskId,
          title: task.title,
          status: "approved",
          approvedAt: new Date(),
          budgetLocked: totalBudgetRequired,
        },
      });
    } catch (transactionError) {
      // Abort transaction on error
      await session.abortTransaction();
      throw transactionError;
    }
  } catch (error) {
    console.error("[APPROVE TASK] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to approve task",
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
