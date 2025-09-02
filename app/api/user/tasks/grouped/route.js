import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// GET /api/user/tasks/grouped - Get grouped user tasks (active, pending, completed)
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
      .find({ _id: { $in: taskIds.map((id) => new ObjectId(id)) } })
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
        taskId: userTask.taskId.toString(),
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
