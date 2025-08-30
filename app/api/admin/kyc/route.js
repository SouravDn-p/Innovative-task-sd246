import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check admin authentication
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get admin user to verify role
    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");
    const kycApplicationsCollection = db.collection("kyc-applications");

    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "submittedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build filter query for kyc-applications collection
    const filter = {};

    // Filter by KYC status
    if (status && status !== "all") {
      filter.status =
        status === "verified"
          ? "verified"
          : status === "rejected"
          ? "rejected"
          : "pending";
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) {
        filter.submittedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.submittedAt.$lte = endDate;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get KYC applications with pagination
    const kycApplications = await kycApplicationsCollection
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalApplications = await kycApplicationsCollection.countDocuments(
      filter
    );

    // Get user data for each application
    const userEmails = kycApplications.map((app) => app.userEmail);
    const userData = await usersCollection
      .find({ email: { $in: userEmails } }, { projection: { password: 0 } })
      .toArray();

    // Create a map for quick user lookup
    const userMap = userData.reduce((map, user) => {
      map[user.email] = user;
      return map;
    }, {});

    // Transform the data for frontend consumption
    const transformedApplications = kycApplications.map((application) => {
      const user = userMap[application.userEmail] || {};

      return {
        _id: application._id.toString(),
        applicationId: application._id.toString(),
        userId: application.userId?.toString() || user._id?.toString(),
        userName: application.userName || user.name || "N/A",
        email: application.userEmail,
        phone: application.phone || user.phone || "N/A",
        kycStatus: user.kycStatus || application.status || "pending",
        submittedAt: application.submittedAt || null,
        reviewedAt: application.reviewedAt || user.kycReviewedAt || null,
        rejectionReason:
          application.rejectionReason || user.kycRejectionReason || null,
        paymentStatus: application.paymentStatus || "not_paid",
        completionPercentage: application.completionPercentage || 0,
        documents: application.documents || {
          aadhar: { uploaded: false, status: "not_uploaded" },
          pan: { uploaded: false, status: "not_uploaded" },
          selfie: { uploaded: false, status: "not_uploaded" },
          bankStatement: { uploaded: false, status: "not_uploaded" },
        },
        personalInfo: {
          fullName: application.userName || user.name || "N/A",
          email: application.userEmail,
          phone: application.phone || user.phone || "N/A",
          joinDate: user.createdAt
            ? new Date(user.createdAt).toISOString().split("T")[0]
            : null,
        },
        // Calculate priority based on submission date and payment status
        priority: calculatePriority(application),
        // Track review assignment
        assignedTo: application.assignedTo || user.kycAssignedTo || null,
        reviewHistory: application.reviewHistory || user.kycReviewHistory || [],
      };
    });

    // Calculate summary statistics from kyc-applications collection
    const statistics = {
      totalApplications,
      pendingApplications: await kycApplicationsCollection.countDocuments({
        status: "pending",
      }),
      approvedApplications: await kycApplicationsCollection.countDocuments({
        status: "verified",
      }),
      rejectedApplications: await kycApplicationsCollection.countDocuments({
        status: "rejected",
      }),
      paidApplications: await kycApplicationsCollection.countDocuments({
        paymentStatus: "paid",
      }),
      unpaidApplications: await kycApplicationsCollection.countDocuments({
        paymentStatus: { $ne: "paid" },
      }),
    };

    // Pagination info
    const pagination = {
      page,
      limit,
      totalApplications,
      totalPages: Math.ceil(totalApplications / limit),
      hasNext: page * limit < totalApplications,
      hasPrev: page > 1,
    };

    return NextResponse.json({
      applications: transformedApplications,
      statistics,
      pagination,
    });
  } catch (error) {
    console.error("Admin KYC fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate priority
function calculatePriority(application) {
  if (!application.submittedAt) return "low";

  const submissionDate = new Date(application.submittedAt);
  const daysSinceSubmission =
    (Date.now() - submissionDate) / (1000 * 60 * 60 * 24);
  const isPaid = application.paymentStatus === "paid";

  // High priority: Paid users or submissions older than 7 days
  if (isPaid || daysSinceSubmission > 7) return "high";

  // Medium priority: Submissions 3-7 days old
  if (daysSinceSubmission > 3) return "medium";

  // Low priority: Recent submissions
  return "low";
}
