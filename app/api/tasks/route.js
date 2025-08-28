import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

// 📌 GET all available tasks api/tasks
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Build filter for available tasks only
    const filter = {
      status: "approved", // Only approved tasks
      endAt: { $gte: new Date() }, // Tasks that haven't ended
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add type filter
    if (type) {
      filter.type = type;
    }

    // Get all matching tasks
    const tasks = await db
      .collection("tasks")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Available tasks:", tasks);

    // Get current assignment counts for each task to calculate remaining slots
    const taskIds = tasks.map((task) => task._id);
    const assignmentCounts = await db
      .collection("userTasks")
      .aggregate([
        { $match: { taskId: { $in: taskIds } } },
        { $group: { _id: "$taskId", count: { $sum: 1 } } },
      ])
      .toArray();

    const assignmentMap = assignmentCounts.reduce((map, item) => {
      map[item._id.toString()] = item.count;
      return map;
    }, {});

    // Format response - show only available tasks
    const availableTasks = tasks
      .map((task) => {
        const taskIdStr = task._id.toString();
        const assignedCount = assignmentMap[taskIdStr] || 0;
        const remainingSlots = Math.max(0, task.limitCount - assignedCount);

        return {
          ...task,
          _id: taskIdStr,
          id: taskIdStr,
          assignedCount,
          remainingSlots,
          isAvailable: remainingSlots > 0 && new Date() <= new Date(task.endAt),
          reward: task.rateToUser,
          remaining: remainingSlots,
          total: task.limitCount,
          category: task.type,
          requirements: task.proofRequirements?.details || [],
          estimatedTime: task.estimatedTime || "30 mins",
          taskStatus: "available",
        };
      })
      .filter((task) => task.isAvailable); // Only return tasks that are actually available

    return new Response(JSON.stringify(availableTasks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET Error:", err);
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// 📌 Create a new task (requires auth)
export async function POST(req) {
  try {
    // ✅ Extract JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const taskData = await req.json();

    // ✅ Validate required fields
    const requiredFields = [
      "title",
      "type",
      "description",
      "proofRequirements",
      "rateToUser",
      "limitCount",
      "startAt",
      "endAt",
    ];
    const missingFields = requiredFields.filter((field) => !taskData[field]);
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Validate task type
    const validTypes = [
      "video",
      "install",
      "share",
      "review",
      "social",
      "custom",
    ];
    if (!validTypes.includes(taskData.type)) {
      return new Response(JSON.stringify({ message: "Invalid task type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Validate proofRequirements
    const validProofTypes = ["text", "link", "document"];
    if (
      !taskData.proofRequirements.type ||
      !validProofTypes.includes(taskData.proofRequirements.type) ||
      !taskData.proofRequirements.details
    ) {
      return new Response(
        JSON.stringify({ message: "Invalid proof requirements" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Validate dates
    if (new Date(taskData.startAt) >= new Date(taskData.endAt)) {
      return new Response(
        JSON.stringify({ message: "End date must be after start date" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Calculate total cost for the task
    const rateToUser = parseFloat(taskData.rateToUser);
    const advertiserCost = rateToUser * 1.2; // 20% platform fee
    const totalCost = advertiserCost * parseInt(taskData.limitCount);

    // Payment validation for non-admin users
    let paymentDone = false;
    let paymentMethod = taskData.paymentMethod || "wallet";

    if (token.role?.toLowerCase() !== "admin") {
      // Check if payment is required
      if (taskData.requirePayment !== false) {
        // Default to true unless explicitly false
        if (paymentMethod === "wallet") {
          // Get user's current wallet balance
          const user = await db
            .collection("Users")
            .findOne({ email: token.email });
          const currentBalance = user?.walletBalance || 0;

          console.log(
            `[TASK CREATION] Payment validation - Required: ${totalCost}, Available: ${currentBalance}, PayNow: ${taskData.payNow}`
          );

          // If payNow is true, require immediate payment
          if (taskData.payNow === true) {
            if (currentBalance < totalCost) {
              return new Response(
                JSON.stringify({
                  message: "Insufficient wallet balance",
                  error: "INSUFFICIENT_BALANCE",
                  required: totalCost,
                  available: currentBalance,
                  shortfall: totalCost - currentBalance,
                  breakdown: {
                    ratePerUser: rateToUser,
                    platformFee: "20%",
                    costPerUser: advertiserCost,
                    totalUsers: parseInt(taskData.limitCount),
                    totalCost: totalCost,
                  },
                }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                }
              );
            }

            // Deduct payment from wallet immediately
            const newBalance = currentBalance - totalCost;

            // Update user wallet balance
            await db.collection("Users").updateOne(
              { email: token.email },
              {
                $set: {
                  walletBalance: newBalance,
                  updatedAt: new Date(),
                },
              }
            );

            // Create wallet transaction record
            await db.collection("walletTransactions").insertOne({
              userEmail: token.email,
              userId: user._id,
              type: "debit",
              amount: totalCost,
              description: `Payment for task: ${taskData.title}`,
              reference: `TASK_PAYMENT_${Date.now()}`,
              balanceBefore: currentBalance,
              balanceAfter: newBalance,
              taskTitle: taskData.title,
              adminAction: false,
              createdAt: new Date(),
            });

            paymentDone = true;
            console.log(
              `[TASK CREATION] Payment processed immediately. New balance: ${newBalance}`
            );
          } else {
            // Payment will be processed during approval
            console.log(`[TASK CREATION] Payment deferred to approval stage`);
            paymentDone = false;
          }
        } else if (paymentMethod === "external") {
          // For external payment methods (stripe, razorpay, etc.)
          // This would integrate with payment gateway
          // For now, mark as pending payment
          paymentDone = taskData.paymentConfirmed === true;
        }
      } else {
        // No payment required (free task creation)
        paymentDone = true;
      }
    } else {
      // Admin created tasks are automatically paid
      paymentDone = true;
    }

    const task = {
      ...taskData,
      rateToUser,
      advertiserCost,
      totalCost,
      limitCount: parseInt(taskData.limitCount),
      completedCount: 0,
      status: token.role?.toLowerCase() === "admin" ? "approved" : "pending",
      createdBy: token.role?.toLowerCase() || "advertiser",
      gmail: token.email || "unknown@gmail.com",
      name: token.name || "Unknown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentDone,
      paymentMethod,
      paymentAmount: totalCost,
    };

    const result = await db.collection("tasks").insertOne(task);

    // Format response with extended JSON _id
    const createdTask = {
      ...task,
      _id: { $oid: result.insertedId.toString() },
    };

    return new Response(
      JSON.stringify({
        message: "Task created successfully",
        task: createdTask,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
