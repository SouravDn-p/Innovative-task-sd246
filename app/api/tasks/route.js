import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// 📌 GET all tasks
export async function GET() {
  try {
    const db = client.db("TaskEarnDB");
    const tasks = await db.collection("tasks").find({}).toArray();

    // Convert ObjectId to extended JSON format
    const formattedTasks = tasks.map((task) => ({
      ...task,
      _id: { $oid: task._id.toString() },
    }));

    return new Response(JSON.stringify(formattedTasks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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

// 📌 Create a new task (requires auth)
export async function POST(req) {
  try {
    // ✅ Extract JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const taskData = await req.json();

    // ✅ Validate required fields
    const requiredFields = [
      "title",
      "type",
      "description",
      "proofRequirements",
      "rateToUser",
      "limitCount",
      "startAt",
      "endAt",
    ];
    const missingFields = requiredFields.filter((field) => !taskData[field]);
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Validate task type
    const validTypes = [
      "video",
      "install",
      "share",
      "review",
      "social",
      "custom",
    ];
    if (!validTypes.includes(taskData.type)) {
      return new Response(JSON.stringify({ message: "Invalid task type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Validate proofRequirements
    const validProofTypes = ["text", "link", "document"];
    if (
      !taskData.proofRequirements.type ||
      !validProofTypes.includes(taskData.proofRequirements.type) ||
      !taskData.proofRequirements.details
    ) {
      return new Response(
        JSON.stringify({ message: "Invalid proof requirements" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Validate dates
    if (new Date(taskData.startAt) >= new Date(taskData.endAt)) {
      return new Response(
        JSON.stringify({ message: "End date must be after start date" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const db = client.db("TaskEarnDB");
    const task = {
      ...taskData,
      rateToUser: parseFloat(taskData.rateToUser),
      advertiserCost: parseFloat(taskData.rateToUser) * 1.2,
      limitCount: parseInt(taskData.limitCount),
      completedCount: 0,
      status: token.role?.toLowerCase() === "admin" ? "approved" : "pending",
      createdBy: token.role?.toLowerCase() || "advertiser",
      gmail: token.email || "unknown@gmail.com",
      name: token.name || "Unknown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentDone: false,
    };

    const result = await db.collection("tasks").insertOne(task);

    // Format response with extended JSON _id
    const createdTask = {
      ...task,
      _id: { $oid: result.insertedId.toString() },
    };

    return new Response(
      JSON.stringify({
        message: "Task created successfully",
        task: createdTask,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
