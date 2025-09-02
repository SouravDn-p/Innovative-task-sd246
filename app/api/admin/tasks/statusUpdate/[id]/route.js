import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
// Import client directly instead of clientPromise
import client from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { safeNumber, formatCurrency, isValidObjectId } from "@/lib/utils";

export async function PUT(req, { params }) {
  console.log("[STATUS UPDATE TASK] Route hit with params:", params);

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log(
      "[STATUS UPDATE TASK] Token retrieved:",
      token?.email,
      token?.role
    );

    const { id: taskId } = await params;
    console.log("[STATUS UPDATE TASK] Task ID extracted:", taskId);

    console.log(
      "[STATUS UPDATE TASK] Starting status update process for task:",
      taskId
    );

    if (!token) {
      console.log("[STATUS UPDATE TASK] Unauthorized: No token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[STATUS UPDATE TASK] Token validated, checking role...");
    if (token.role !== "admin") {
      console.log("[STATUS UPDATE TASK] Forbidden: User role is", token.role);
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }
    console.log("[STATUS UPDATE TASK] Role validation passed");

    const body = await req.json();
    const { status, note } = body;
    console.log(
      "[STATUS UPDATE TASK] Request body parsed, status:",
      status,
      "note:",
      note
    );

    console.log(
      "[STATUS UPDATE TASK] Admin",
      token.email,
      "updating task",
      taskId,
      "to status:",
      status,
      "with note:",
      note
    );

    // Connect client and get database
    await client.connect();
    const db = client.db("TaskEarnDB");
    console.log("[STATUS UPDATE TASK] Database connection established");

    // Validate taskId format
    if (!isValidObjectId(taskId)) {
      console.log("[STATUS UPDATE TASK] Invalid task ID format:", taskId);
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Validate status
    const validStatuses = [
      "pending",
      "approved",
      "paused",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      console.log("[STATUS UPDATE TASK] Invalid status:", status);
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Start atomic transaction
    const session = client.startSession();
    session.startTransaction();
    console.log("[STATUS UPDATE TASK] Transaction started");

    try {
      // Find task within transaction
      const task = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) }, { session });
      console.log(
        "[STATUS UPDATE TASK] Task lookup result:",
        task ? "Found" : "Not found"
      );

      console.log(
        "[STATUS UPDATE TASK] Found task:",
        task
          ? {
              id: task._id,
              title: task.title,
              status: task.status,
            }
          : "null"
      );

      if (!task) {
        console.log("[STATUS UPDATE TASK] Task not found:", taskId);
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        await session.endSession();
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      // Check if task already has this status
      if (task.status === status) {
        console.log(
          "[STATUS UPDATE TASK] Task already has status:",
          taskId,
          status
        );
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        await session.endSession();
        return NextResponse.json(
          { error: `Task already has status: ${status}` },
          { status: 400 }
        );
      }

      // Special handling for approval
      if (status === "approved" && task.status !== "approved") {
        // Calculate total budget required for the task using safe number handling
        const advertiserCost = safeNumber(task.advertiserCost);
        const limitCount = safeNumber(task.limitCount);
        const totalBudgetRequired = advertiserCost * limitCount;

        console.log("[STATUS UPDATE TASK] Budget calculation for approval:", {
          advertiserCost,
          limitCount,
          totalBudgetRequired,
          paymentDone: task.paymentDone,
        });

        // Always validate payment for approval, regardless of paymentDone status
        console.log("[STATUS UPDATE TASK] Validating payment for approval");
        const creator = await db
          .collection("Users")
          .findOne({ email: task.gmail }, { session });

        if (!creator) {
          console.log(
            "[STATUS UPDATE TASK] Task creator not found:",
            task.gmail
          );
          if (session.inTransaction()) {
            await session.abortTransaction();
          }
          await session.endSession();
          return NextResponse.json(
            { error: "Task creator not found" },
            { status: 404 }
          );
        }

        const currentBalance = safeNumber(creator.walletBalance);
        console.log(
          "[STATUS UPDATE TASK] Creator wallet balance:",
          formatCurrency(currentBalance)
        );
        const hasPayment = currentBalance >= totalBudgetRequired;

        if (!hasPayment) {
          console.log(
            "[STATUS UPDATE TASK] Insufficient wallet balance for approval"
          );
          if (session.inTransaction()) {
            await session.abortTransaction();
          }
          await session.endSession();
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
          console.log(
            "[STATUS UPDATE TASK] Processing payment during approval"
          );
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
            "[STATUS UPDATE TASK] Payment processed successfully. New balance:",
            formatCurrency(newBalance)
          );
        } else {
          console.log(
            "[STATUS UPDATE TASK] Payment already processed during task creation"
          );
        }
      }

      // Update task status within transaction
      console.log("[STATUS UPDATE TASK] Updating task status:", taskId, status);

      const updateData = {
        status: status,
        updatedAt: new Date(),
      };

      // Add approval-specific fields if approving
      if (status === "approved") {
        updateData.approvedAt = new Date();
        updateData.approvedBy = token.email;
        updateData.approvalNote = note || "";
        updateData.paymentDone = true;
      }

      // Add completion-specific fields if completing
      if (status === "completed") {
        updateData.completedAt = new Date();
        updateData.completedBy = token.email;
      }

      const taskUpdateResult = await db.collection("tasks").updateOne(
        { _id: new ObjectId(taskId) },
        {
          $set: updateData,
        },
        { session }
      );

      console.log("[STATUS UPDATE TASK] Database update result:", {
        acknowledged: taskUpdateResult.acknowledged,
        modifiedCount: taskUpdateResult.modifiedCount,
        matchedCount: taskUpdateResult.matchedCount,
        taskId: taskId,
      });

      if (taskUpdateResult.modifiedCount === 0) {
        throw new Error(
          "Failed to update task status - no changes made to database"
        );
      }

      // Log admin action within transaction
      await db.collection("adminActions").insertOne(
        {
          action: `update_task_status_${status}`,
          adminEmail: token.email,
          targetTaskId: taskId,
          details: {
            taskTitle: task.title,
            oldStatus: task.status,
            newStatus: status,
            note: note || "",
            updateDate: new Date(),
          },
          timestamp: new Date(),
        },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();
      await session.endSession();

      console.log(
        "[STATUS UPDATE TASK] Task status updated successfully:",
        taskId
      );

      return NextResponse.json({
        message: `Task status updated to ${status} successfully`,
        task: {
          id: taskId,
          title: task.title,
          status: status,
          updatedAt: new Date(),
        },
      });
    } catch (transactionError) {
      // Abort transaction on error
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      if (session) {
        await session.endSession();
      }
      throw transactionError;
    }
  } catch (error) {
    console.error("[STATUS UPDATE TASK] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update task status",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
