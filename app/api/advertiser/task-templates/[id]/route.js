import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "@/lib/utils";

// GET a specific task template for advertisers
export async function GET(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { id } = await params;

    console.log("Fetching task template:", {
      id,
      userEmail: token?.email,
      userRole: token?.role,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow both admin and advertiser access
    if (token.role !== "admin" && token.role !== "advertiser") {
      return NextResponse.json(
        { error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // For advertisers, only fetch active templates
    const filter =
      token.role === "advertiser"
        ? { _id: new ObjectId(id), isActive: true }
        : { _id: new ObjectId(id) };

    const template = await db.collection("taskTemplates").findOne(filter);

    if (!template) {
      console.log("Template not found:", { id, filter });
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    console.log("Template found:", {
      id: template._id.toString(),
      title: template.title,
    });

    return NextResponse.json({
      template: {
        ...template,
        _id: template._id.toString(),
      },
    });
  } catch (error) {
    console.error("Get task template error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
