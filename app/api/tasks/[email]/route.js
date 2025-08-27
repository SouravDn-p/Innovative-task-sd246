import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient";

// GET all tasks for a user by email
export async function GET(req, { params }) {
  try {
    const { email } = params;

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.email !== email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = client.db("TaskEarnDB");
    const tasks = await db
      .collection("tasks")
      .find({ userEmail: email })
      .toArray();

    return NextResponse.json(tasks, { status: 200 });
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

// POST create a task for a user
export async function POST(req, { params }) {
  try {
    const { email } = params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.email !== email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const db = client.db("TaskEarnDB");

    const newTask = {
      userEmail: email,
      title: body.title,
      status: body.status || "pending",
      priority: body.priority || "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { insertedId } = await db.collection("tasks").insertOne(newTask);

    return NextResponse.json(
      { ...newTask, _id: insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
