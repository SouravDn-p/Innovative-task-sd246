// app/api/auth/update-role/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import client from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    // Get session
    const session = await getServerSession(authOptions); // Removed `req` as it’s not needed in App Router
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { role } = body;
    if (!["user", "advertiser"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate user ID
    const userId = session.user.id;
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Connect to MongoDB
    const db = client.db("TaskEarnDB");
    const result = await db.collection("Users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: "Role updated successfully" });
    } else {
      return NextResponse.json({ error: "User not found or role unchanged" }, { status: 404 });
    }
  } catch (e) {
    console.error("Update role error:", e);
    return NextResponse.json({ error: `Server error: ${e.message}` }, { status: 500 });
  }
}