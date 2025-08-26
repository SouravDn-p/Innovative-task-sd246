import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient"; 
import { ObjectId } from "mongodb";

// GET a single task by id
export async function GET(req, { params }) {
  try {
    const { email, id } = params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.email !== email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = client.db("TaskEarnDB");

    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      userEmail: email,
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

// PUT update a task
export async function PUT(req, { params }) {
  try {
    const { email, id } = params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.email !== email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const db = client.db("TaskEarnDB");

    const updatedTask = await db
      .collection("tasks")
      .findOneAndUpdate(
        { _id: new ObjectId(id), userEmail: email },
        { $set: { ...body, updatedAt: new Date() } },
        { returnDocument: "after" }
      );

    if (!updatedTask.value) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask.value, { status: 200 });
  } catch (err) {
    console.error("PUT Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

// DELETE a task
export async function DELETE(req, { params }) {
  try {
    const { email, id } = params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.email !== email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = client.db("TaskEarnDB");

    const result = await db.collection("tasks").deleteOne({
      _id: new ObjectId(id),
      userEmail: email,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
