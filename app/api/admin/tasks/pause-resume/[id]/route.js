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
      "[PAUSE/RESUME TASK] Starting pause/resume process for task:",
      taskId
    );

    if (!token) {
      console.log("[PAUSE/RESUME TASK] Unauthorized: No token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      console.log("[PAUSE/RESUME TASK] Forbidden: User role is", token.role);
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, reason, duration } = body;

    console.log(
      "[PAUSE/RESUME TASK] Admin",
      token.email,
      action,
      "task",
      taskId,
      "with reason:",
      reason,
      "and duration:",
      duration
    );

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Validate taskId format
    if (!isValidObjectId(taskId)) {
      console.log("[PAUSE/RESUME TASK] Invalid task ID format:", taskId);
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Validate action
    if (action !== "pause" && action !== "resume") {
      console.log("[PAUSE/RESUME TASK] Invalid action:", action);
      return NextResponse.json(
        { error: "Invalid action. Must be 'pause' or 'resume'" },
        { status: 400 }
      );
    }

    // Start atomic transaction
    session.startTransaction();

    try {
      // Find task within transaction
      const task = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) }, { session });

      console.log(
        "[PAUSE/RESUME TASK] Found task:",
        task
          ? {
              id: task._id,
              title: task.title,
              status: task.status,
            }
          : "null"
      );

      if (!task) {
        console.log("[PAUSE/RESUME TASK] Task not found:", taskId);
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      // Check if task can be paused/resumed
      if (action === "pause") {
        if (task.status !== "approved") {
          console.log(
            "[PAUSE/RESUME TASK] Cannot pause task with status:",
            task.status
          );
          return NextResponse.json(
            { error: `Cannot pause task with status: ${task.status}` },
            { status: 400 }
          );
        }
      } else if (action === "resume") {
        if (task.status !== "paused") {
          console.log(
            "[PAUSE/RESUME TASK] Cannot resume task with status:",
            task.status
          );
          return NextResponse.json(
            { error: `Cannot resume task with status: ${task.status}` },
            { status: 400 }
          );
        }
      }

      // Determine new status
      const newStatus = action === "pause" ? "paused" : "approved";

      // Update task status within transaction
      console.log(
        "[PAUSE/RESUME TASK] Updating task status:",
        taskId,
        newStatus
      );
      const taskUpdateResult = await db.collection("tasks").updateOne(
        { _id: new ObjectId(taskId) },
        {
          $set: {
            status: newStatus,
            updatedAt: new Date(),
            [action === "pause" ? "pausedAt" : "resumedAt"]: new Date(),
            [action === "pause" ? "pausedBy" : "resumedBy"]: token.email,
            [action === "pause" ? "pauseReason" : "resumeReason"]: reason || "",
            ...(action === "pause" && duration
              ? { pauseDuration: duration }
              : {}),
          },
        },
        { session }
      );

      console.log("[PAUSE/RESUME TASK] Database update result:", {
        acknowledged: taskUpdateResult.acknowledged,
        modifiedCount: taskUpdateResult.modifiedCount,
        matchedCount: taskUpdateResult.matchedCount,
        taskId: taskId,
      });

      if (taskUpdateResult.modifiedCount === 0) {
        throw new Error(
          `Failed to ${action} task - no changes made to database`
        );
      }

      // Log admin action within transaction
      await db.collection("adminActions").insertOne(
        {
          action: `${action}_task`,
          adminEmail: token.email,
          targetTaskId: taskId,
          details: {
            taskTitle: task.title,
            oldStatus: task.status,
            newStatus: newStatus,
            reason: reason || "",
            duration: duration || null,
            actionDate: new Date(),
          },
          timestamp: new Date(),
        },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

      console.log("[PAUSE/RESUME TASK] Task", action, "successfully:", taskId);

      return NextResponse.json({
        message: `Task ${action}d successfully`,
        task: {
          id: taskId,
          title: task.title,
          status: newStatus,
          [action === "pause" ? "pausedAt" : "resumedAt"]: new Date(),
        },
      });
    } catch (transactionError) {
      // Abort transaction on error
      await session.abortTransaction();
      throw transactionError;
    }
  } catch (error) {
    console.error("[PAUSE/RESUME TASK] Error:", error);
    return NextResponse.json(
      {
        error: `Failed to ${action} task`,
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
