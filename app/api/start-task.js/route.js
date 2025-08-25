import { getServerSession } from "next-auth/next"; // or your session logic
import { authOptions } from "./auth/[...nextauth]"; // if using NextAuth
import { connectToDB } from "@/lib/mongodb"; // your DB connection
import TaskModel from "@/models/task";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const { taskId } = req.body;

  if (!taskId) return res.status(400).json({ message: "Task ID is required" });

  try {
    await connectToDB();

    const task = await TaskModel.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // save task started by this user
    task.startedBy = {
      name: session.user.name,
      email: session.user.email,
      startedAt: new Date(),
    };
    await task.save();

    res.status(200).json({ message: "Task started successfully", task });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
