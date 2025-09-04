import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");
    const advertiserRequestsCollection = db.collection("advertiser-requests");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status") || "pending";
    const search = searchParams.get("search") || "";

    // Build filter
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    } else if (!status) {
      // Default to showing only pending requests
      filter.status = "pending";
    }

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { contactEmail: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Get requests with pagination
    const requests = await advertiserRequestsCollection
      .find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalRequests = await advertiserRequestsCollection.countDocuments(
      filter
    );

    // Enrich with user data
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const user = await usersCollection.findOne({
          email: request.userEmail,
        });
        return {
          ...request,
          _id: request._id.toString(),
          user: user
            ? {
                name: user.name,
                email: user.email,
                phone: user.phone,
                kycStatus: user.kycStatus,
                joinDate: user.createdAt
                  ? new Date(user.createdAt).toISOString().split("T")[0]
                  : null,
                isSuspended: user.isSuspended || false,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      requests: enrichedRequests,
      pagination: {
        page,
        limit,
        totalRequests,
        totalPages: Math.ceil(totalRequests / limit),
        hasNext: page * limit < totalRequests,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Admin advertiser requests fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");
    const advertiserRequestsCollection = db.collection("advertiser-requests");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { requestId, action, reviewNotes } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Find the request
    const request = await advertiserRequestsCollection.findOne({
      _id: new ObjectId(requestId),
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Update request status
    const updateData = {
      status: action === "approve" ? "approved" : "rejected",
      reviewedAt: new Date(),
      reviewedBy: adminUser._id.toString(),
      reviewNotes: reviewNotes || "",
    };

    await advertiserRequestsCollection.updateOne(
      { _id: new ObjectId(requestId) },
      { $set: updateData }
    );

    // If approved, update user role and create advertiser profile
    if (action === "approve") {
      const advertiserProfile = {
        companyName: request.companyName,
        approvedAt: new Date(),
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        totalExpense: 0,
        performanceScore: 0,
      };

      await usersCollection.updateOne(
        { email: request.userEmail },
        {
          $set: {
            role: "advertiser",
            advertiserProfile,
            advertiserRequestStatus: "approved",
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // If rejected, update user status
      await usersCollection.updateOne(
        { email: request.userEmail },
        {
          $set: {
            advertiserRequestStatus: "rejected",
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      message: `Request ${action}d successfully`,
      request: { ...request, ...updateData },
    });
  } catch (error) {
    console.error("Admin advertiser request update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
