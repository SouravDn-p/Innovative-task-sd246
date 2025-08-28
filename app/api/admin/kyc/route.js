import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

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
    const sortBy = searchParams.get("sortBy") || "kycSubmittedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build filter query
    const filter = {};

    // Filter by KYC status
    if (status && status !== "all") {
      if (status === "none") {
        filter.$or = [
          { kycStatus: { $exists: false } },
          { kycStatus: "none" },
          { kycStatus: null },
        ];
      } else {
        filter.kycStatus = status;
      }
    } else {
      // Only show users who have submitted KYC (exclude none/null)
      filter.kycStatus = { $exists: true, $ne: "none", $ne: null };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.kycSubmittedAt = {};
      if (dateFrom) {
        filter.kycSubmittedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.kycSubmittedAt.$lte = endDate;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get KYC applications with pagination
    const kycApplications = await usersCollection
      .find(filter)
      .project({
        password: 0, // Exclude password field
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalApplications = await usersCollection.countDocuments(filter);

    // Transform the data for frontend consumption
    const transformedApplications = kycApplications.map((user) => ({
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
      },
      // Calculate priority based on submission date and payment status
      priority: calculatePriority(user),
      // Track review assignment (can be extended later)
      assignedTo: user.kycAssignedTo || null,
    }));

    // Calculate summary statistics
    const statistics = {
      totalApplications,
      pendingApplications: await usersCollection.countDocuments({
        kycStatus: "pending",
      }),
      approvedApplications: await usersCollection.countDocuments({
        kycStatus: "verified",
      }),
      rejectedApplications: await usersCollection.countDocuments({
        kycStatus: "rejected",
      }),
      paidApplications: await usersCollection.countDocuments({
        kycPaymentStatus: "paid",
        kycStatus: { $exists: true, $ne: "none" },
      }),
      unpaidApplications: await usersCollection.countDocuments({
        kycPaymentStatus: { $ne: "paid" },
        kycStatus: { $exists: true, $ne: "none" },
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
function calculatePriority(user) {
  if (!user.kycSubmittedAt) return "low";

  const submissionDate = new Date(user.kycSubmittedAt);
  const daysSinceSubmission =
    (Date.now() - submissionDate) / (1000 * 60 * 60 * 24);
  const isPaid = user.kycPaymentStatus === "paid";

  // High priority: Paid users or submissions older than 7 days
  if (isPaid || daysSinceSubmission > 7) return "high";

  // Medium priority: Submissions 3-7 days old
  if (daysSinceSubmission > 3) return "medium";

  // Low priority: Recent submissions
  return "low";
}
