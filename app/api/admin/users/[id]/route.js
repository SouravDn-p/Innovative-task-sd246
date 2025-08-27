import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function GET(req, context) {
  try {
    const { params } = await context;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const userId = params.id;

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get user by ID or email
    let user;
    if (ObjectId.isValid(userId)) {
      user = await db.collection("Users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { password: 0 } }
      );
    } else {
      user = await db.collection("Users").findOne(
        { email: userId },
        { projection: { password: 0 } }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get comprehensive user data
    const userTasks = await db.collection("userTasks").find({ userEmail: user.email }).toArray();
    const taskSubmissions = await db.collection("taskSubmissions").find({ userEmail: user.email }).toArray();
    const walletTransactions = await db.collection("walletTransactions").find({ userEmail: user.email }).sort({ createdAt: -1 }).limit(50).toArray();
    
    // Get referral information
    const referrals = await db.collection("Users").find({ referrerId: user.referralId }).project({ name: 1, email: 1, createdAt: 1, totalEarn: 1 }).toArray();
    
    // Get suspension history
    const suspensionHistory = user.suspensionHistory || [];

    // Get KYC documents if available
    const kycDocuments = user.kycDocuments || {};

    // Build comprehensive user profile
    const userProfile = {
      ...user,
      _id: user._id.toString(),
      
      // Personal Information
      personalInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        bio: user.bio,
        location: user.location,
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : null,
        lastActive: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : null,
      },

      // Account Status
      accountStatus: {
        role: user.role || "user",
        isVerified: user.isVerified || false,
        isSuspended: user.isSuspended || false,
        suspendedReason: user.suspendedReason,
        suspensionAt: user.suspensionAt,
        lastSuspensionCount: user.lastSuspensionCount || 0,
      },

      // KYC Information
      kycInfo: {
        status: user.kycStatus || "none",
        submittedAt: user.kycSubmittedAt,
        reviewedAt: user.kycReviewedAt,
        rejectionReason: user.kycRejectionReason,
        paymentStatus: user.kycPaymentStatus || "not_paid",
        paymentAmount: 99,
        documents: kycDocuments,
        completionPercentage: user.kycCompletionPercentage || 0,
      },

      // Wallet Information
      walletInfo: {
        balance: user.walletBalance || 0,
        totalEarnings: user.totalEarn || 0,
        referralEarnings: user.referralEarnings || 0,
        taskEarnings: user.taskEarnings || 0,
        weeklyEarnAmount: user.weeklyEarnAmount || 0,
        transactions: walletTransactions.map(tx => ({
          ...tx,
          _id: tx._id.toString(),
        })),
      },

      // Task Statistics
      taskStats: {
        totalTasks: userTasks.length,
        completedTasks: userTasks.filter(task => 
          task.status === "completed" || task.paymentReceivedStatus === "completed"
        ).length,
        pendingTasks: userTasks.filter(task => task.status === "pending").length,
        activeTasks: userTasks.filter(task => task.status === "active").length,
        totalSubmissions: taskSubmissions.length,
        approvedSubmissions: taskSubmissions.filter(sub => sub.status === "approved").length,
        rejectedSubmissions: taskSubmissions.filter(sub => sub.status === "rejected").length,
        recentTasks: userTasks.slice(0, 10).map(task => ({
          ...task,
          _id: task._id.toString(),
        })),
      },

      // Referral Information
      referralInfo: {
        referralId: user.referralId,
        referrerId: user.referrerId,
        totalReferrals: referrals.length,
        dailyReferralsCount: user.dailyReferralsCount || 0,
        referrals: referrals.map(ref => ({
          ...ref,
          _id: ref._id.toString(),
        })),
      },

      // Suspension History
      suspensionHistory: suspensionHistory.map(suspension => ({
        ...suspension,
        date: suspension.date ? new Date(suspension.date).toISOString() : null,
      })),
    };

    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error("Admin user details fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}