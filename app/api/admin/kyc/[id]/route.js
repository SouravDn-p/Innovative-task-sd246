import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import client from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// GET individual KYC application details
export async function GET(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check admin authentication
    if (!token || !token.email) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in as admin." },
        { status: 401 }
      );
    }

    // Use the client directly, not as a promise
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");
    const kycApplicationsCollection = db.collection("kyc-applications");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Admin access required. You don't have permission to perform this action.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get KYC application by ID from kyc-applications collection
    const kycApplication = await kycApplicationsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!kycApplication) {
      return NextResponse.json(
        {
          error:
            "KYC application not found. The application may have been deleted.",
        },
        { status: 404 }
      );
    }

    // Get corresponding user data
    const user = await usersCollection.findOne(
      { email: kycApplication.userEmail },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Transform application data for KYC review
    const applicationDetails = {
      _id: kycApplication._id.toString(),
      applicationId: kycApplication._id.toString(),
      userId: kycApplication.userId?.toString() || user._id.toString(),
      userName: kycApplication.userName || user.name || "N/A",
      email: kycApplication.userEmail,
      phone: kycApplication.phone || user.phone || "N/A",
      kycStatus: user.kycStatus || kycApplication.status || "pending",
      submittedAt: kycApplication.submittedAt || null,
      reviewedAt: kycApplication.reviewedAt || user.kycReviewedAt || null,
      rejectionReason:
        kycApplication.rejectionReason || user.kycRejectionReason || null,
      paymentStatus: kycApplication.paymentStatus || "not_paid",
      completionPercentage: kycApplication.completionPercentage || 0,
      documents: kycApplication.documents || {
        aadhar: { uploaded: false, status: "not_uploaded" },
        pan: { uploaded: false, status: "not_uploaded" },
        selfie: { uploaded: false, status: "not_uploaded" },
        bankStatement: { uploaded: false, status: "not_uploaded" },
      },
      personalInfo: {
        fullName: kycApplication.userName || user.name || "N/A",
        email: kycApplication.userEmail,
        phone: kycApplication.phone || user.phone || "N/A",
        joinDate: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : null,
        role: user.role || "user",
        isVerified: user.isVerified || false,
      },
      assignedTo: kycApplication.assignedTo || user.kycAssignedTo || null,
      reviewHistory:
        kycApplication.reviewHistory || user.kycReviewHistory || [],
    };

    return NextResponse.json({
      application: applicationDetails,
    });
  } catch (error) {
    console.error("KYC application fetch error:", error);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while fetching the KYC application. Please try again.",
      },
      { status: 500 }
    );
  }
}

// POST - Approve or reject KYC application
export async function POST(req, { params }) {
  let session;

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check admin authentication
    if (!token || !token.email) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in as admin." },
        { status: 401 }
      );
    }

    // Use the client directly, not as a promise
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");
    const kycApplicationsCollection = db.collection("kyc-applications");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Admin access required. You don't have permission to perform this action.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { action, rejectionReason, notes } = await req.json();

    // Validate action
    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Please specify 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    // If rejecting, require rejection reason
    if (action === "reject" && !rejectionReason) {
      return NextResponse.json(
        {
          error:
            "Rejection reason is required when rejecting a KYC application.",
        },
        { status: 400 }
      );
    }

    // Start transaction for atomic operations
    session = client.startSession();
    session.startTransaction();

    // Get KYC application to update
    const kycApplication = await kycApplicationsCollection.findOne(
      { _id: new ObjectId(id) },
      { session }
    );

    if (!kycApplication) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          error:
            "KYC application not found. The application may have been deleted.",
        },
        { status: 404 }
      );
    }

    // Get corresponding user
    const user = await usersCollection.findOne(
      { email: kycApplication.userEmail },
      { session }
    );

    if (!user) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Check if KYC is in a state that can be reviewed
    if (
      kycApplication.status === "verified" ||
      kycApplication.status === "rejected"
    ) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          error:
            "KYC application has already been reviewed and cannot be modified.",
        },
        { status: 400 }
      );
    }

    // Prepare update fields for application
    const applicationUpdateFields = {
      reviewedAt: new Date(),
      reviewedBy: adminUser.email,
      reviewerName: adminUser.name || adminUser.email,
      updatedAt: new Date(),
    };

    // Prepare update fields for user
    const userUpdateFields = {
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
      // Update application status
      applicationUpdateFields.status = "verified";
      applicationUpdateFields.rejectionReason = null; // Clear any previous rejection reason

      // Update user status and reference
      userUpdateFields.kycStatus = "verified";
      userUpdateFields.isVerified = true;
      userUpdateFields.kycReferenceId = kycApplication._id;
      userUpdateFields.kycRejectionReason = null; // Clear any previous rejection reason
    } else if (action === "reject") {
      // Update application status
      applicationUpdateFields.status = "rejected";
      applicationUpdateFields.rejectionReason = rejectionReason;

      // Update user status
      userUpdateFields.kycStatus = "rejected";
      userUpdateFields.kycRejectionReason = rejectionReason;
      userUpdateFields.isVerified = false;
    }

    // Update KYC application
    const applicationUpdateResult = await kycApplicationsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: applicationUpdateFields,
        $push: { reviewHistory: reviewEntry },
      },
      { session }
    );

    if (applicationUpdateResult.modifiedCount === 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Failed to update KYC application. Please try again." },
        { status: 500 }
      );
    }

    // Update user record
    const userUpdateResult = await usersCollection.updateOne(
      { email: kycApplication.userEmail },
      {
        $set: userUpdateFields,
        $push: { kycReviewHistory: reviewEntry },
      },
      { session }
    );

    if (userUpdateResult.modifiedCount === 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Failed to update user KYC status. Please try again." },
        { status: 500 }
      );
    }

    // Log the admin action for audit purposes
    await db.collection("AdminLogs").insertOne(
      {
        adminEmail: adminUser.email,
        adminName: adminUser.name || adminUser.email,
        action: `KYC_${action.toUpperCase()}`,
        targetUserId: user._id.toString(),
        targetUserEmail: user.email,
        targetApplicationId: id,
        details: {
          previousStatus: kycApplication.status,
          newStatus: action === "approve" ? "verified" : "rejected",
          rejectionReason: rejectionReason || null,
          notes: notes || "",
        },
        timestamp: new Date(),
      },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    return NextResponse.json({
      message: `KYC application ${action}ed successfully`,
      newStatus: action === "approve" ? "verified" : "rejected",
      reviewedBy: adminUser.name || adminUser.email,
      reviewedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Make sure to abort transaction if it's still active
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        // Ignore abort errors
      }
    }

    console.error("KYC review error:", error);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while processing the KYC application. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch (sessionError) {
        // Ignore session end errors
      }
    }
  }
}

// PUT - Update KYC application (assign reviewer, add notes, etc.)
export async function PUT(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check admin authentication
    if (!token || !token.email) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in as admin." },
        { status: 401 }
      );
    }

    // Use the client directly, not as a promise
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");
    const kycApplicationsCollection = db.collection("kyc-applications");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Admin access required. You don't have permission to perform this action.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { assignTo, notes, priority } = await req.json();

    const updateFields = {
      updatedAt: new Date(),
      lastModifiedBy: adminUser.email,
    };

    if (assignTo !== undefined) {
      updateFields.assignedTo = assignTo;
    }

    if (notes) {
      updateFields.adminNotes = notes;
    }

    if (priority) {
      updateFields.priority = priority;
    }

    // Update KYC application
    const updateResult = await kycApplicationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update KYC application. Please try again." },
        { status: 500 }
      );
    }

    // Also update user record for backward compatibility
    const userUpdateFields = {};
    if (assignTo !== undefined) {
      userUpdateFields.kycAssignedTo = assignTo;
    }
    if (notes) {
      userUpdateFields.kycAdminNotes = notes;
    }
    if (priority) {
      userUpdateFields.kycPriority = priority;
    }

    if (Object.keys(userUpdateFields).length > 0) {
      userUpdateFields.kycLastModified = new Date();
      userUpdateFields.kycLastModifiedBy = adminUser.email;

      // Get application to find user email
      const kycApplication = await kycApplicationsCollection.findOne({
        _id: new ObjectId(id),
      });
      if (kycApplication) {
        await usersCollection.updateOne(
          { email: kycApplication.userEmail },
          { $set: userUpdateFields }
        );
      }
    }

    return NextResponse.json({
      message: "KYC application updated successfully",
      updatedFields: updateFields,
    });
  } catch (error) {
    console.error("KYC update error:", error);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while updating the KYC application. Please try again.",
      },
      { status: 500 }
    );
  }
}