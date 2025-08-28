import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

// GET individual KYC application details
export async function GET(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check admin authentication
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Get user by ID
    const user = await usersCollection.findOne(
      {
        _id: new db.ObjectId(id),
      },
      {
        projection: { password: 0 }, // Exclude password
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform user data for KYC review
    const kycApplication = {
      _id: user._id.toString(),
      userId: user._id.toString(),
      userName: user.name || "N/A",
      email: user.email,
      phone: user.phone || "N/A",
      kycStatus: user.kycStatus || "none",
      submittedAt: user.kycSubmittedAt || null,
      reviewedAt: user.kycReviewedAt || null,
      rejectionReason: user.kycRejectionReason || null,
      paymentStatus: user.kycPaymentStatus || "not_paid",
      completionPercentage: user.kycCompletionPercentage || 0,
      documents: user.kycDocuments || {
        aadhar: { uploaded: false, status: "not_uploaded" },
        pan: { uploaded: false, status: "not_uploaded" },
        selfie: { uploaded: false, status: "not_uploaded" },
        bankStatement: { uploaded: false, status: "not_uploaded" },
      },
      personalInfo: {
        fullName: user.name || "N/A",
        email: user.email,
        phone: user.phone || "N/A",
        joinDate: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : null,
        role: user.role || "user",
        isVerified: user.isVerified || false,
      },
      assignedTo: user.kycAssignedTo || null,
      reviewHistory: user.kycReviewHistory || [],
    };

    return NextResponse.json({
      application: kycApplication,
    });
  } catch (error) {
    console.error("KYC application fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Approve or reject KYC application
export async function POST(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check admin authentication
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const { action, rejectionReason, notes } = await req.json();

    // Validate action
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // If rejecting, require rejection reason
    if (action === "reject" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Get user to update
    const user = await usersCollection.findOne({
      _id: new db.ObjectId(id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if KYC is in a state that can be reviewed
    if (!user.kycStatus || user.kycStatus === "none") {
      return NextResponse.json(
        {
          error: "No KYC application found for this user",
        },
        { status: 400 }
      );
    }

    if (user.kycStatus === "verified" || user.kycStatus === "rejected") {
      return NextResponse.json(
        {
          error: "KYC application has already been reviewed",
        },
        { status: 400 }
      );
    }

    // Prepare update fields
    const updateFields = {
      kycReviewedAt: new Date(),
      kycReviewedBy: adminUser.email,
      kycReviewerName: adminUser.name || adminUser.email,
    };

    // Create review entry for history
    const reviewEntry = {
      reviewedAt: new Date(),
      reviewedBy: adminUser.email,
      reviewerName: adminUser.name || adminUser.email,
      action,
      notes: notes || "",
      rejectionReason: rejectionReason || null,
    };

    if (action === "approve") {
      updateFields.kycStatus = "verified";
      updateFields.isVerified = true;
      // Clear any previous rejection reason
      updateFields.kycRejectionReason = null;
    } else if (action === "reject") {
      updateFields.kycStatus = "rejected";
      updateFields.kycRejectionReason = rejectionReason;
      updateFields.isVerified = false;
    }

    // Add to review history
    updateFields.$push = {
      kycReviewHistory: reviewEntry,
    };

    // Update user in database
    const updateResult = await usersCollection.updateOne(
      { _id: new db.ObjectId(id) },
      {
        $set: updateFields,
        $push: updateFields.$push,
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update KYC status" },
        { status: 500 }
      );
    }

    // Log the admin action for audit purposes
    await db.collection("AdminLogs").insertOne({
      adminEmail: adminUser.email,
      adminName: adminUser.name || adminUser.email,
      action: `KYC_${action.toUpperCase()}`,
      targetUserId: id,
      targetUserEmail: user.email,
      details: {
        previousStatus: user.kycStatus,
        newStatus: action === "approve" ? "verified" : "rejected",
        rejectionReason: rejectionReason || null,
        notes: notes || "",
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: `KYC application ${action}ed successfully`,
      newStatus: action === "approve" ? "verified" : "rejected",
      reviewedBy: adminUser.name || adminUser.email,
      reviewedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("KYC review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update KYC application (assign reviewer, add notes, etc.)
export async function PUT(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check admin authentication
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const { assignTo, notes, priority } = await req.json();

    const updateFields = {};

    if (assignTo !== undefined) {
      updateFields.kycAssignedTo = assignTo;
    }

    if (notes) {
      updateFields.kycAdminNotes = notes;
    }

    if (priority) {
      updateFields.kycPriority = priority;
    }

    // Update last modified timestamp
    updateFields.kycLastModified = new Date();
    updateFields.kycLastModifiedBy = adminUser.email;

    const updateResult = await usersCollection.updateOne(
      { _id: new db.ObjectId(id) },
      { $set: updateFields }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update KYC application" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "KYC application updated successfully",
      updatedFields: updateFields,
    });
  } catch (error) {
    console.error("KYC update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
