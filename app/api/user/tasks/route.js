import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// GET /api/user/tasks - Get grouped user tasks (active, pending, completed)
export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userEmail = token.email;
    const db = client.db("TaskEarnDB");

    // Get all user tasks for the logged-in user
    const userTasks = await db
      .collection("userTasks")
      .find({ userEmail })
      .toArray();

    // Get task details for all user tasks
    const taskIds = userTasks.map((ut) => ut.taskId);
    const tasks = await db
      .collection("tasks")
      .find({ _id: { $in: taskIds } })
      .toArray();

    // Create a map of task details
    const taskMap = tasks.reduce((map, task) => {
      map[task._id.toString()] = task;
      return map;
    }, {});

    // Get task submissions for the user
    const taskSubmissions = await db
      .collection("taskSubmissions")
      .find({ userEmail })
      .toArray();

    // Create a map of submissions by taskId
    const submissionMap = taskSubmissions.reduce((map, submission) => {
      map[submission.taskId.toString()] = submission;
      return map;
    }, {});

    // Group tasks by status
    const active = [];
    const pending = [];
    const completed = [];

    userTasks.forEach((userTask) => {
      const taskDetails = taskMap[userTask.taskId.toString()];
      const submission = submissionMap[userTask.taskId.toString()];

      const enhancedTask = {
        ...userTask,
        _id: userTask._id.toString(),
        task: taskDetails,
        submission: submission || null,
      };

      // Determine status based on submission and task status
      if (submission && submission.status === "pending") {
        pending.push(enhancedTask);
      } else if (
        (submission && submission.status === "approved") ||
        userTask.paymentReceivedStatus === "completed"
      ) {
        completed.push(enhancedTask);
      } else if (userTask.status === "active") {
        active.push(enhancedTask);
      }
    });

    return new Response(
      JSON.stringify({
        active,
        pending,
        completed,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("GET Error:", err);
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("Received body:", body); // Debug received data
    const { taskId, userEmail, userName } = body;

    // Validate required fields
    if (!taskId || !userEmail || !userName) {
      return new Response(
        JSON.stringify({
          message: "Task ID, user email, and user name required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate taskId is a 24-character hex string
    console.log("taskId:", taskId); // Debug taskId
    // if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
    //   return new Response(
    //     JSON.stringify({ message: "Invalid task ID format" }),
    //     { status: 400, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    const db = client.db("TaskEarnDB");

    // Check if task exists
    const task = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(taskId) });
    if (!task) {
      return new Response(JSON.stringify({ message: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if task is available
    if (task.status !== "approved" && task.status !== "pending") {
      return new Response(JSON.stringify({ message: "Task not available" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check task limit
    if (task.completedCount >= task.limitCount) {
      return new Response(JSON.stringify({ message: "Task limit reached" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    if (now < new Date(task.startAt)) {
      return new Response(
        JSON.stringify({
          message: "Task not available yet",
          details: `This task starts on ${new Date(
            task.startAt
          ).toLocaleString()}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (now > new Date(task.endAt)) {
      return new Response(
        JSON.stringify({
          message: "Task has expired",
          details: `This task ended on ${new Date(
            task.endAt
          ).toLocaleString()}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user exists (optional, can be relaxed if user is created elsewhere)
    const user = await db.collection("Users").findOne({ email: userEmail });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check KYC if required
    if (task.requireKyc && user.kycStatus !== "verified") {
      return new Response(
        JSON.stringify({ message: "KYC verification required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if task is already assigned to user
    const existingUserTask = await db
      .collection("userTasks")
      .findOne({ taskId: new ObjectId(taskId), userEmail });
    if (existingUserTask) {
      return new Response(
        JSON.stringify({ message: "Task already assigned" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert new user task
    const newUserTask = {
      taskId: new ObjectId(taskId),
      userEmail,
      userId: user._id || new ObjectId(), // Use user's _id if available, otherwise generate
      userName,
      dateCreated: new Date(),
      payment: task.rateToUser || 0, // Default to task's rateToUser
      acceptance: "pending", // Initial acceptance status
      paymentReceivedStatus: "pending", // Initial payment status
      status: "active", // Task status for user
      updatedAt: new Date(),
    };

    const result = await db.collection("userTasks").insertOne(newUserTask);

    return new Response(
      JSON.stringify({
        message: "Task assigned successfully",
        userTask: { ...newUserTask, _id: result.insertedId.toString() },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
