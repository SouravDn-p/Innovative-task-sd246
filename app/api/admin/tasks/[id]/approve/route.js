import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
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

    // Find task
    let task;
    if (ObjectId.isValid(taskId)) {
      task = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) });
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
    } else {
      console.log("[APPROVE TASK] Invalid task ID format:", taskId);
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

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

    // Calculate total budget required for the task
    const totalBudgetRequired = task.advertiserCost * task.limitCount;
    console.log("[APPROVE TASK] Budget calculation:", {
      advertiserCost: task.advertiserCost,
      limitCount: task.limitCount,
      totalBudgetRequired,
      paymentDone: task.paymentDone,
    });

    // Always validate payment for approval, regardless of paymentDone status
    // This ensures the advertiser has sufficient funds before task goes live
    console.log("[APPROVE TASK] Validating payment for approval");
    const creator = await db.collection("Users").findOne({ email: task.gmail });

    if (!creator) {
      console.log("[APPROVE TASK] Task creator not found:", task.gmail);
      return NextResponse.json(
        { error: "Task creator not found" },
        { status: 404 }
      );
    }

    console.log(
      "[APPROVE TASK] Creator wallet balance:",
      creator.walletBalance
    );
    const hasPayment = creator.walletBalance >= totalBudgetRequired;

    if (!hasPayment) {
      console.log("[APPROVE TASK] Insufficient wallet balance for approval");
      return NextResponse.json(
        {
          error: `Insufficient budget. Required: ₹${totalBudgetRequired.toFixed(
            2
          )}, Available: ₹${(creator.walletBalance || 0).toFixed(2)}`,
          paymentRequired: true,
          budgetRequired: totalBudgetRequired,
          availableBalance: creator.walletBalance || 0,
          message: "Please add funds to your wallet before approval",
        },
        { status: 400 }
      );
    }

    // If payment wasn't done during creation, process it now
    if (!task.paymentDone) {
      console.log("[APPROVE TASK] Processing payment during approval");
      const newBalance = creator.walletBalance - totalBudgetRequired;

      // Update user wallet balance
      await db.collection("Users").updateOne(
        { email: task.gmail },
        {
          $set: {
            walletBalance: newBalance,
            updatedAt: new Date(),
          },
        }
      );

      // Create wallet transaction record
      await db.collection("walletTransactions").insertOne({
        userEmail: task.gmail,
        userId: creator._id,
        type: "debit",
        amount: totalBudgetRequired,
        description: `Payment for approved task: ${task.title}`,
        reference: `TASK_APPROVAL_PAYMENT_${Date.now()}`,
        balanceBefore: creator.walletBalance,
        balanceAfter: newBalance,
        taskTitle: task.title,
        adminAction: true,
        adminEmail: token.email,
        createdAt: new Date(),
      });

      console.log(
        "[APPROVE TASK] Payment processed successfully. New balance:",
        newBalance
      );
    } else {
      console.log(
        "[APPROVE TASK] Payment already processed during task creation"
      );
    }

    // Update task status to approved
    console.log("[APPROVE TASK] Updating task status to approved:", taskId);
    const result = await db.collection("tasks").updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          status: "approved",
          approvedAt: new Date(),
          approvedBy: token.email,
          approvalNote: note || "",
          updatedAt: new Date(),
        },
      }
    );

    console.log("[APPROVE TASK] Database update result:", {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      taskId: taskId,
    });

    if (result.modifiedCount === 0) {
      console.log(
        "[APPROVE TASK] No documents were modified - task may not exist or already approved"
      );
      // Try to fetch the task again to see current status
      const currentTask = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) });
      console.log(
        "[APPROVE TASK] Current task status:",
        currentTask
          ? {
              id: currentTask._id,
              title: currentTask.title,
              status: currentTask.status,
              approvedBy: currentTask.approvedBy,
            }
          : "Task not found"
      );

      return NextResponse.json(
        {
          error: "Failed to approve task - no changes made to database",
          details: "Task may already be approved or doesn't exist",
          taskStatus: currentTask?.status || "unknown",
        },
        { status: 500 }
      );
    }

    // Lock advertiser budget (optional - can be done when users complete tasks)
    // For now, we'll just mark the payment as done
    await db
      .collection("tasks")
      .updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { paymentDone: true } }
      );

    // Log admin action
    await db.collection("adminActions").insertOne({
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
    });

    console.log("[APPROVE TASK] Task approved successfully:", taskId);

    return NextResponse.json({
      message: "Task approved successfully",
      task: {
        id: taskId,
        title: task.title,
        status: "approved",
        approvedAt: new Date(),
        budgetLocked: task.advertiserCost * task.limitCount,
      },
    });
  } catch (error) {
    console.error("[APPROVE TASK] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
