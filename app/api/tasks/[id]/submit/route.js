import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;
    const body = await req.json();
    const { proofData, note } = body;

    // Validate required fields
    if (
      !proofData ||
      (!proofData.images?.length && !proofData.links && !proofData.description)
    ) {
      return NextResponse.json(
        {
          error: "At least one proof (image, link, or description) is required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Verify task exists
    const task = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(taskId) });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify user has joined this task
    const userTask = await db.collection("userTasks").findOne({
      taskId: new ObjectId(taskId),
      userEmail: token.email,
    });

    if (!userTask) {
      return NextResponse.json(
        { error: "You must join this task before submitting proof" },
        { status: 403 }
      );
    }

    // Check if user has already submitted proof for this task
    const existingSubmission = await db.collection("taskSubmissions").findOne({
      taskId: new ObjectId(taskId),
      userEmail: token.email,
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted proof for this task" },
        { status: 409 }
      );
    }

    // Create submission document
    const submission = {
      taskId: new ObjectId(taskId),
      userEmail: token.email,
      userName: token.name || token.email?.split("@")[0],
      proofData: {
        images: proofData.images || [],
        links: proofData.links || "",
        description: proofData.description || "",
      },
      note: note || "",
      status: "pending", // pending, approved, rejected
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      reviewFeedback: "",
      taskDetails: {
        title: task.title,
        reward: task.rateToUser,
        category: task.type,
      },
    };

    // Insert submission
    const result = await db.collection("taskSubmissions").insertOne(submission);

    // Update user task status to pending review
    await db.collection("userTasks").updateOne(
      { _id: userTask._id },
      {
        $set: {
          status: "pending",
          submittedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        message: "Task proof submitted successfully",
        submissionId: result.insertedId.toString(),
        submission: {
          ...submission,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Task submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit task proof" },
      { status: 500 }
    );
  }
}
