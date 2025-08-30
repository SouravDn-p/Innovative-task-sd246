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

    // Quick overview stats for navigation
    const [totalUsers, totalTasks, pendingKyc, pendingSubmissions] =
      await Promise.all([
        db.collection("Users").countDocuments({}),
        db.collection("tasks").countDocuments({}),
        db.collection("Users").countDocuments({ kycStatus: "pending" }),
        db.collection("taskSubmissions").countDocuments({ status: "pending" }),
      ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalTasks,
        pendingKyc,
        pendingSubmissions,
        alerts: pendingKyc + pendingSubmissions,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
