import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongoClient";

export async function GET(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email } = await params;

    // Check if the user is requesting their own data or is an admin
    if (token.email !== email && token.role !== "admin") {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get user tasks
    const userTasks = await db
      .collection("userTasks")
      .find({ userEmail: email })
      .toArray();

    // Get actual task details for recent tasks
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

    // Get task submissions
    const taskSubmissions = await db
      .collection("taskSubmissions")
      .find({ userEmail: email })
      .toArray();

    // Calculate statistics
    const completedTasks = userTasks.filter(
      (task) =>
        task.status === "completed" ||
        task.paymentReceivedStatus === "completed"
    ).length;

    const totalEarned = userTasks
      .filter((task) => task.paymentReceivedStatus === "completed")
      .reduce((sum, task) => sum + (task.payment || 0), 0);

    const recentTasks = userTasks
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
      .slice(0, 5)
      .map((task) => {
        const taskDetails = taskMap[task.taskId.toString()];
        return {
          id: task._id.toString(),
          title: taskDetails?.title || "Task",
          reward: task.payment || 0,
          status:
            task.status === "completed" ||
            task.paymentReceivedStatus === "completed"
              ? "completed"
              : "in-progress",
          date: new Date(task.dateCreated).toISOString().split("T")[0],
        };
      });

    return new Response(
      JSON.stringify({
        userTasks: userTasks.map((task) => ({
          ...task,
          _id: task._id.toString(),
        })),
        statistics: {
          totalEarned,
          tasksCompleted: completedTasks,
          activeTasks: userTasks.filter((task) => task.status === "active")
            .length,
          pendingTasks: userTasks.filter((task) => task.status === "pending")
            .length,
        },
        recentTasks,
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
