import clientPromise from "@/lib/mongoClient";

/**
 * Migration script to update existing tasks for the new approval system
 *
 * This script will:
 * 1. Set status to "approved" for all existing tasks (to maintain current behavior)
 * 2. Add templateId field if it doesn't exist
 * 3. Ensure all tasks have the required fields for the new system
 */
export async function migrateTasks() {
  try {
    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Update all existing tasks to have status "approved"
    // (maintaining current behavior where all tasks are live)
    const result = await db.collection("tasks").updateMany(
      { status: { $exists: false } }, // Tasks without status field
      {
        $set: {
          status: "approved",
          templateId: null,
          paymentDone: { $ifNull: ["$paymentDone", false] },
          updatedAt: new Date().toISOString(),
        },
      }
    );

    console.log(`Migration completed. Updated ${result.modifiedCount} tasks.`);

    // Also update any tasks with "active" status to "approved"
    const activeResult = await db
      .collection("tasks")
      .updateMany({ status: "active" }, { $set: { status: "approved" } });

    console.log(
      `Updated ${activeResult.modifiedCount} active tasks to approved.`
    );

    // Ensure all tasks have required fields
    const fieldUpdateResult = await db.collection("tasks").updateMany(
      {}, // All tasks
      {
        $set: {
          status: { $ifNull: ["$status", "approved"] },
          templateId: { $ifNull: ["$templateId", null] },
          paymentDone: { $ifNull: ["$paymentDone", false] },
          advertiserCost: {
            $ifNull: ["$advertiserCost", { $multiply: ["$rateToUser", 1.2] }],
          },
          totalCost: {
            $ifNull: [
              "$totalCost",
              {
                $multiply: [{ $multiply: ["$rateToUser", 1.2] }, "$limitCount"],
              },
            ],
          },
          createdBy: { $ifNull: ["$createdBy", "advertiser"] },
        },
      }
    );

    console.log(`Updated fields for ${fieldUpdateResult.modifiedCount} tasks.`);

    return {
      success: true,
      message: `Migration completed successfully. Updated ${
        result.modifiedCount +
        activeResult.modifiedCount +
        fieldUpdateResult.modifiedCount
      } tasks.`,
    };
  } catch (error) {
    console.error("Migration error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run migration if script is executed directly
if (typeof window === "undefined" && require.main === module) {
  migrateTasks()
    .then((result) => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
