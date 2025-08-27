import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { taskId } = params;
    const { proofData } = await req.json();

    if (!taskId || !proofData) {
      return new Response(
        JSON.stringify({ message: "Task ID and proof data required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      return new Response(
        JSON.stringify({ message: "Invalid task ID format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

    // Check if user has started the task
    const userTask = await db
      .collection("userTasks")
      .findOne({ taskId: new ObjectId(taskId), userEmail: token.email });
    if (!userTask) {
      return new Response(
        JSON.stringify({ message: "Task not assigned to user" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert proof submission
    const submission = {
      taskId: new ObjectId(taskId),
      userEmail: token.email,
      proofData,
      status: "pending",
      submittedAt: new Date(),
    };

    const result = await db.collection("taskSubmissions").insertOne(submission);

    return new Response(
      JSON.stringify({
        message: "Proof submitted successfully",
        submission: { ...submission, _id: result.insertedId.toString() },
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
