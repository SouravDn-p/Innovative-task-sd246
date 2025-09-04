import client from "@/lib/mongoClient";

/**
 * Check weekly activity rules for a user
 * A user must either:
 * 1. Earn ≥ Rs.1500 per 7 days from tasks, OR
 * 2. Complete at least 5 referrals per day (35 total in 7 days)
 * If not, their account is suspended
 */
export async function checkWeeklyActivityRules(userId) {
  try {
    const db = client.db("TaskEarnDB");
    const users = db.collection("Users");
    const walletTransactions = db.collection("walletTransactions");

    // Get user data
    const user = await users.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    // Skip if user is already suspended
    if (user.isSuspended) {
      return { suspended: false, reason: "User already suspended" };
    }

    // Skip if user is not KYC verified
    if (user.kycStatus !== "verified") {
      return { suspended: false, reason: "User not KYC verified" };
    }

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Calculate task earnings in the last 7 days
    const taskEarningsPipeline = [
      {
        $match: {
          userId: userId.toString(),
          type: "credit",
          description: { $regex: /^Task reward/ },
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
        },
      },
    ];

    const taskEarningsResult = await walletTransactions
      .aggregate(taskEarningsPipeline)
      .toArray();
    const taskEarnings = taskEarningsResult[0]?.totalEarnings || 0;

    // Calculate referrals in the last 7 days
    const referralCountPipeline = [
      {
        $match: {
          referrerId: userId.toString(),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $count: "totalReferrals",
      },
    ];

    const referralCountResult = await db
      .collection("Users")
      .aggregate(referralCountPipeline)
      .toArray();
    const totalReferrals = referralCountResult[0]?.totalReferrals || 0;

    // Check if user meets activity requirements
    const meetsTaskRequirement = taskEarnings >= 1500;
    const meetsReferralRequirement = totalReferrals >= 35; // 5 referrals/day * 7 days

    // If user doesn't meet either requirement, suspend account
    if (!meetsTaskRequirement && !meetsReferralRequirement) {
      // Suspend the user account
      await users.updateOne(
        { _id: userId },
        {
          $set: {
            isSuspended: true,
            suspendedReason: "Failed to meet weekly activity requirements",
            suspensionAt: new Date(),
            lastSuspensionCount: (user.lastSuspensionCount || 0) + 1,
            updatedAt: new Date(),
          },
        }
      );

      return {
        suspended: true,
        reason: "Failed to meet weekly activity requirements",
        taskEarnings,
        totalReferrals,
      };
    }

    return {
      suspended: false,
      taskEarnings,
      totalReferrals,
      meetsTaskRequirement,
      meetsReferralRequirement,
    };
  } catch (error) {
    console.error("Error checking weekly activity rules:", error);
    throw error;
  }
}

/**
 * Check weekly activity for all users
 */
export async function checkAllUsersWeeklyActivity() {
  try {
    const db = client.db("TaskEarnDB");
    const users = db.collection("Users");

    // Get all active, KYC verified users
    const activeUsers = await users
      .find({
        isSuspended: { $ne: true },
        role: "user",
        kycStatus: "verified",
      })
      .toArray();

    const results = [];
    for (const user of activeUsers) {
      try {
        const result = await checkWeeklyActivityRules(user._id);
        results.push({
          userId: user._id,
          email: user.email,
          ...result,
        });
      } catch (error) {
        console.error(`Error checking user ${user.email}:`, error);
        results.push({
          userId: user._id,
          email: user.email,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error checking all users weekly activity:", error);
    throw error;
  }
}
