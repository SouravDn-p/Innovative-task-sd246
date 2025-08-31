import { getToken } from "next-auth/jwt";
import { checkAllUsersWeeklyActivity } from "@/lib/weeklyActivityChecker";

export async function POST(req) {
  try {
    // Check if user is admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Run weekly activity check for all users
    const results = await checkAllUsersWeeklyActivity();

    // Count suspended users
    const suspendedUsers = results.filter((r) => r.suspended).length;
    const activeUsers = results.filter((r) => !r.suspended && !r.error).length;
    const erroredUsers = results.filter((r) => r.error).length;

    return new Response(
      JSON.stringify({
        message: "Weekly activity check completed",
        summary: {
          totalUsers: results.length,
          suspendedUsers,
          activeUsers,
          erroredUsers,
        },
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in weekly activity check:", err);
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
