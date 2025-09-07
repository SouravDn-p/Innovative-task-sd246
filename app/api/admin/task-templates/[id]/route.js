import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "@/lib/utils";

// GET a specific task template
export async function GET(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const template = await db
      .collection("taskTemplates")
      .findOne({ _id: new ObjectId(id) });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

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

// UPDATE a task template
export async function PUT(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Validate min/max values if provided
    if (body.minRateToUser !== undefined && body.maxRateToUser !== undefined) {
      const minRate = parseFloat(body.minRateToUser);
      const maxRate = parseFloat(body.maxRateToUser);

      if (minRate <= 0 || maxRate <= 0 || minRate > maxRate) {
        return NextResponse.json(
          { error: "Invalid rate range" },
          { status: 400 }
        );
      }
    }

    if (body.minLimitCount !== undefined && body.maxLimitCount !== undefined) {
      const minLimit = parseInt(body.minLimitCount);
      const maxLimit = parseInt(body.maxLimitCount);

      if (minLimit <= 0 || maxLimit <= 0 || minLimit > maxLimit) {
        return NextResponse.json(
          { error: "Invalid limit range" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;

    const result = await db
      .collection("taskTemplates")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const updatedTemplate = await db
      .collection("taskTemplates")
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: "Task template updated successfully",
      template: {
        ...updatedTemplate,
        _id: updatedTemplate._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update task template error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a task template
export async function DELETE(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
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

    const result = await db
      .collection("taskTemplates")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Task template deleted successfully" });
  } catch (error) {
    console.error("Delete task template error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
