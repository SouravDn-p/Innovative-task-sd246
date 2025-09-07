import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { safeNumber, sanitizeInput } from "@/lib/utils";

export async function GET(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "Invalid task ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get the task
    const task = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(id) });

    if (!task) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user is authorized to view this task (advertiser who created it or admin)
    if (token.role !== "admin" && task.gmail !== token.email) {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get submission count for this task
    const submissionCount = await db.collection("userTasks").countDocuments({
      taskId: task._id.toString(),
      status: "completed",
    });

    // Get assigned count for this task
    const assignedCount = await db.collection("userTasks").countDocuments({
      taskId: task._id.toString(),
      status: { $in: ["assigned", "completed", "rejected"] },
    });

    // Format the task data
    const formattedTask = {
      ...task,
      _id: task._id.toString(),
      id: task._id.toString(),
      completedCount: submissionCount,
      assignedCount: assignedCount,
      // Ensure requirements is always an array
      requirements: Array.isArray(task.proofRequirements)
        ? task.proofRequirements
        : typeof task.proofRequirements === "string"
        ? [task.proofRequirements]
        : task.proofRequirements?.details
        ? Array.isArray(task.proofRequirements.details)
          ? task.proofRequirements.details
          : [task.proofRequirements.details]
        : [],
      // Ensure targetAudience is properly formatted
      targetAudience: task.targetAudience || {},
    };

    return new Response(JSON.stringify(formattedTask), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET Task Error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "Invalid task ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get the task
    const task = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(id) });

    if (!task) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user is authorized to edit this task (advertiser who created it or admin)
    if (token.role !== "admin" && task.gmail !== token.email) {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();

    // Sanitize inputs
    const updatedTaskData = {
      title: sanitizeInput(body.title),
      description: sanitizeInput(body.description),
      rateToUser: safeNumber(body.rateToUser),
      limitCount: parseInt(body.limitCount),
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      requireKyc: Boolean(body.requireKyc),
      updatedAt: new Date(),
    };

    // Validate dates
    if (updatedTaskData.startAt >= updatedTaskData.endAt) {
      return new Response(
        JSON.stringify({ message: "End date must be after start date" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update the task
    const result = await db
      .collection("tasks")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedTaskData });

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the updated task
    const updatedTask = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(id) });

    // Format the task data
    const formattedTask = {
      ...updatedTask,
      _id: updatedTask._id.toString(),
      id: updatedTask._id.toString(),
    };

    return new Response(
      JSON.stringify({
        task: formattedTask,
        message: "Task updated successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("PUT Task Error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
