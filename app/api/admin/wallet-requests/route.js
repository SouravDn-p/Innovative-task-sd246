import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET(req) {
  try {
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

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get all wallet requests, sorted by creation date (newest first)
    const requests = await db
      .collection("walletRequests")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert ObjectId to string for JSON serialization
    const formattedRequests = requests.map(request => ({
      ...request,
      _id: request._id.toString(),
      userId: request.userId.toString(),
    }));

    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error("Error fetching wallet requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet requests" },
      { status: 500 }
    );
  }
}