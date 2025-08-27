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
    const { note } = body;

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

    // Check if task can be approved
    if (task.status === "approved") {
      return NextResponse.json(
        { error: "Task is already approved" },
        { status: 400 }
      );
    }

    if (task.status === "completed") {
      return NextResponse.json(
        { error: "Cannot approve completed task" },
        { status: 400 }
      );
    }

    // Check payment status
    const creator = await db.collection("Users").findOne({ email: task.gmail });

    if (!creator) {
      return NextResponse.json(
        { error: "Task creator not found" },
        { status: 404 }
      );
    }

    const totalBudgetRequired = task.advertiserCost * task.limitCount;
    const hasPayment = creator.walletBalance >= totalBudgetRequired;

    if (!hasPayment) {
      return NextResponse.json(
        {
          error: `Insufficient budget. Required: ₹${totalBudgetRequired.toFixed(
            2
          )}, Available: ₹${(creator.walletBalance || 0).toFixed(2)}`,
          paymentRequired: true,
          budgetRequired: totalBudgetRequired,
          availableBalance: creator.walletBalance || 0,
        },
        { status: 400 }
      );
    }

    // Update task status to approved
    const result = await db.collection("tasks").updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          status: "approved",
          approvedAt: new Date(),
          approvedBy: token.email,
          approvalNote: note || "",
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to approve task" },
        { status: 500 }
      );
    }

    // Lock advertiser budget (optional - can be done when users complete tasks)
    // For now, we'll just mark the payment as done
    await db
      .collection("tasks")
      .updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { paymentDone: true } }
      );

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "approve_task",
      adminEmail: token.email,
      targetTaskId: taskId,
      details: {
        taskTitle: task.title,
        budgetLocked: totalBudgetRequired,
        note: note || "",
        approvalDate: new Date(),
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Task approved successfully",
      task: {
        id: taskId,
        title: task.title,
        status: "approved",
        approvedAt: new Date(),
        budgetLocked: totalBudgetRequired,
      },
    });
  } catch (error) {
    console.error("Admin approve task error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
