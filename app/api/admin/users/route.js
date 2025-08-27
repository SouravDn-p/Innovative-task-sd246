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

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 20;
    const search = url.searchParams.get("search") || "";
    const kycStatus = url.searchParams.get("kycStatus") || "";
    const status = url.searchParams.get("status") || "";
    const role = url.searchParams.get("role") || "";

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    if (kycStatus && kycStatus !== "all") {
      filter.kycStatus = kycStatus;
    }

    if (status && status !== "all") {
      if (status === "active") {
        filter.isSuspended = { $ne: true };
      } else if (status === "suspended") {
        filter.isSuspended = true;
      }
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await usersCollection
      .find(filter)
      .project({ password: 0 }) // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalUsers = await usersCollection.countDocuments(filter);

    // Get additional statistics for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // Get user tasks statistics
        const userTasks = await db.collection("userTasks").find({ userEmail: user.email }).toArray();
        const taskSubmissions = await db.collection("taskSubmissions").find({ userEmail: user.email }).toArray();

        return {
          ...user,
          _id: user._id.toString(),
          // Task statistics
          tasksCompleted: userTasks.filter(task => 
            task.status === "completed" || task.paymentReceivedStatus === "completed"
          ).length,
          pendingTasks: userTasks.filter(task => task.status === "pending").length,
          activeTasks: userTasks.filter(task => task.status === "active").length,
          totalSubmissions: taskSubmissions.length,
          approvedSubmissions: taskSubmissions.filter(sub => sub.status === "approved").length,
          rejectedSubmissions: taskSubmissions.filter(sub => sub.status === "rejected").length,
          // Referral statistics
          totalReferrals: user.Recent_Referrals?.length || 0,
          // Wallet information
          walletBalance: user.walletBalance || 0,
          totalEarn: user.totalEarn || 0,
          // Dates
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : null,
          lastActive: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : null,
        };
      })
    );

    // Calculate summary statistics
    const summary = {
      totalUsers,
      activeUsers: await usersCollection.countDocuments({ isSuspended: { $ne: true } }),
      suspendedUsers: await usersCollection.countDocuments({ isSuspended: true }),
      verifiedKyc: await usersCollection.countDocuments({ kycStatus: "verified" }),
      pendingKyc: await usersCollection.countDocuments({ kycStatus: "pending" }),
      rejectedKyc: await usersCollection.countDocuments({ kycStatus: "rejected" }),
    };

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1,
      },
      summary,
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}