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
    const { action, reason, duration } = body; // action: "pause" | "resume"

    if (!action || !["pause", "resume"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'pause' or 'resume'" },
        { status: 400 }
      );
    }

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

    let updateData = {};
    let actionMessage = "";

    if (action === "pause") {
      // Validate pause conditions
      if (task.status === "paused") {
        return NextResponse.json(
          { error: "Task is already paused" },
          { status: 400 }
        );
      }

      if (task.status !== "approved") {
        return NextResponse.json(
          { error: "Can only pause approved/running tasks" },
          { status: 400 }
        );
      }

      if (!reason) {
        return NextResponse.json(
          { error: "Reason is required for pausing task" },
          { status: 400 }
        );
      }

      updateData = {
        status: "paused",
        pausedAt: new Date(),
        pausedBy: token.email,
        pauseReason: reason,
        pauseDuration: duration || null,
        previousStatus: task.status,
        updatedAt: new Date(),
      };

      actionMessage = "Task paused successfully";
    } else {
      // Resume action
      if (task.status !== "paused") {
        return NextResponse.json(
          { error: "Can only resume paused tasks" },
          { status: 400 }
        );
      }

      updateData = {
        status: task.previousStatus || "approved",
        resumedAt: new Date(),
        resumedBy: token.email,
        resumeReason: reason || "Admin resume",
        updatedAt: new Date(),
        // Clear pause data
        $unset: {
          pausedAt: "",
          pausedBy: "",
          pauseReason: "",
          pauseDuration: "",
          previousStatus: "",
        },
      };

      actionMessage = "Task resumed successfully";
    }

    // Update task
    const result = await db
      .collection("tasks")
      .updateOne(
        { _id: new ObjectId(taskId) },
        {
          $set: updateData,
          ...(updateData.$unset && { $unset: updateData.$unset }),
        }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: `Failed to ${action} task` },
        { status: 500 }
      );
    }

    // Update user tasks status if pausing
    if (action === "pause") {
      await db.collection("userTasks").updateMany(
        { taskId: new ObjectId(taskId), status: "active" },
        {
          $set: {
            status: "paused",
            pausedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Resume user tasks
      await db.collection("userTasks").updateMany(
        { taskId: new ObjectId(taskId), status: "paused" },
        {
          $set: {
            status: "active",
            resumedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    }

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: `${action}_task`,
      adminEmail: token.email,
      targetTaskId: taskId,
      details: {
        taskTitle: task.title,
        reason: reason || "",
        duration: duration || null,
        previousStatus: action === "pause" ? task.status : task.previousStatus,
        actionDate: new Date(),
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: actionMessage,
      task: {
        id: taskId,
        title: task.title,
        status:
          action === "pause" ? "paused" : task.previousStatus || "approved",
        actionDate: new Date(),
        reason: reason || "",
      },
    });
  } catch (error) {
    console.error(`Admin ${action} task error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
