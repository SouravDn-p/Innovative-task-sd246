import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient";

export async function GET(req) {
  try {
    // This endpoint should only be accessible via cron/scheduled jobs
    // In production, you should add authentication/authorization checks here
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.CRON_AUTH_TOKEN;

    if (!authHeader || !authHeader.includes(`Bearer ${expectedToken}`)) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = client.db("TaskEarnDB");
    const users = db.collection("Users");

    // Reset daily referral counts for all users
    const result = await users.updateMany(
      {},
      {
        $set: {
          dailyReferralsCount: 0,
          updatedAt: new Date(),
        },
      }
    );

    // Also reset weekly earnings for activity tracking
    await users.updateMany(
      {},
      {
        $set: {
          weeklyEarnAmount: 0,
          updatedAt: new Date(),
        },
      }
    );

    return new Response(
      JSON.stringify({
        message: "Daily reset completed successfully",
        usersUpdated: result.modifiedCount,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Daily reset error:", err);
    return new Response(
      JSON.stringify({
        message: "Server error",
        error:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
