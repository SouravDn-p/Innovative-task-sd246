import { checkAllUsersWeeklyActivity } from "@/lib/weeklyActivityChecker";

/**
 * Scheduled task to run weekly activity checks
 * This should be called by a cron job or similar scheduling system
 */
export async function runWeeklyActivityCheck() {
  try {
    console.log("Starting weekly activity check for all users...");

    const startTime = new Date();
    const results = await checkAllUsersWeeklyActivity();
    const endTime = new Date();

    // Count suspended users
    const suspendedUsers = results.filter((r) => r.suspended).length;
    const activeUsers = results.filter((r) => !r.suspended && !r.error).length;
    const erroredUsers = results.filter((r) => r.error).length;

    console.log(`Weekly activity check completed in ${endTime - startTime}ms`);
    console.log(
      `Summary: ${results.length} total users, ${suspendedUsers} suspended, ${activeUsers} active, ${erroredUsers} errors`
    );

    return {
      success: true,
      summary: {
        totalUsers: results.length,
        suspendedUsers,
        activeUsers,
        erroredUsers,
        duration: endTime - startTime,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in scheduled weekly activity check:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
