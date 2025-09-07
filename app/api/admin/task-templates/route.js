import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// GET all task templates
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

    const templates = await db
      .collection("taskTemplates")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

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

// CREATE a new task template
export async function POST(req) {
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

    const body = await req.json();

    // Validate required fields
    const requiredFields = [
      "title",
      "type",
      "description",
      "proofRequirements",
      "minRateToUser",
      "maxRateToUser",
      "minLimitCount",
      "maxLimitCount",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate task type
    const validTypes = [
      "video",
      "install",
      "share",
      "review",
      "social",
      "custom",
    ];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid task type" }, { status: 400 });
    }

    // Validate min/max values
    const minRate = parseFloat(body.minRateToUser);
    const maxRate = parseFloat(body.maxRateToUser);
    const minLimit = parseInt(body.minLimitCount);
    const maxLimit = parseInt(body.maxLimitCount);

    if (minRate <= 0 || maxRate <= 0 || minRate > maxRate) {
      return NextResponse.json(
        { error: "Invalid rate range" },
        { status: 400 }
      );
    }

    if (minLimit <= 0 || maxLimit <= 0 || minLimit > maxLimit) {
      return NextResponse.json(
        { error: "Invalid limit range" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    const template = {
      ...body,
      minRateToUser: minRate,
      maxRateToUser: maxRate,
      minLimitCount: minLimit,
      maxLimitCount: maxLimit,
      createdBy: token.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const result = await db.collection("taskTemplates").insertOne(template);

    return NextResponse.json({
      message: "Task template created successfully",
      template: {
        ...template,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Create task template error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
