import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

// GET all active task templates for advertisers
export async function GET(req) {
  try {
    console.log("Fetching task templates for advertiser...");

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      console.log("Unauthorized access to task templates");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow both admin and advertiser access
    if (token.role !== "admin" && token.role !== "advertiser") {
      console.log("Forbidden access to task templates:", token.role);
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Only fetch active templates for advertisers
    const filter = token.role === "advertiser" ? { isActive: true } : {};

    console.log("Fetching templates with filter:", filter);

    const templates = await db
      .collection("taskTemplates")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Found templates:", templates.length);

    const formattedTemplates = templates.map((template) => ({
      ...template,
      _id: template._id.toString(),
    }));

    return NextResponse.json({ templates: formattedTemplates });
  } catch (error) {
    console.error("Get task templates error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
