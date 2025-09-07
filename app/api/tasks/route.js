import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";
import {
  safeNumber,
  formatCurrencyINR,
  sanitizeInput,
  validateEmail,
  isValidObjectId,
} from "@/lib/utils";

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
      // endAt: { $gte: new Date() }, // Tasks that haven't ended
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

        // Ensure requirements is always an array
        let requirements = [];
        if (Array.isArray(task.proofRequirements?.details)) {
          requirements = task.proofRequirements.details;
        } else if (typeof task.proofRequirements?.details === "string") {
          requirements = [task.proofRequirements.details];
        } else if (Array.isArray(task.proofRequirements)) {
          requirements = task.proofRequirements;
        } else if (typeof task.proofRequirements === "string") {
          requirements = [task.proofRequirements];
        }

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
          requirements: requirements,
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
    console.log("Creating new task...");

    // ✅ Extract JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const taskData = await req.json();
    console.log("Task data received:", {
      ...taskData,
      userEmail: token.email,
      userRole: token.role,
    });

    // ✅ For advertisers, ensure they're using a template
    if (token.role?.toLowerCase() !== "admin") {
      // Advertisers must use a template
      if (!taskData.templateId) {
        return new Response(
          JSON.stringify({
            message: "Advertisers must create tasks from templates",
            error: "TEMPLATE_REQUIRED",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

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

    // ✅ Validate that end date is not more than 1 year in the future
    const maxEndDate = new Date();
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
    if (new Date(taskData.endAt) > maxEndDate) {
      return new Response(
        JSON.stringify({
          message: "End date cannot be more than 1 year in the future",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // ✅ For template-based tasks, validate against template constraints
    if (taskData.templateId && token.role?.toLowerCase() !== "admin") {
      console.log("Validating template constraints for task creation...");

      // Fetch the template
      const template = await db
        .collection("taskTemplates")
        .findOne({ _id: new ObjectId(taskData.templateId) });

      if (!template) {
        return new Response(
          JSON.stringify({
            message: "Invalid template ID",
            error: "INVALID_TEMPLATE",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Validate rate is within template constraints
      const rateToUser = parseFloat(taskData.rateToUser);
      if (
        rateToUser < template.minRateToUser ||
        rateToUser > template.maxRateToUser
      ) {
        return new Response(
          JSON.stringify({
            message: `Reward must be between ₹${template.minRateToUser} and ₹${template.maxRateToUser}`,
            error: "INVALID_RATE",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Validate limit is within template constraints
      const limitCount = parseInt(taskData.limitCount);
      if (
        limitCount < template.minLimitCount ||
        limitCount > template.maxLimitCount
      ) {
        return new Response(
          JSON.stringify({
            message: `Limit must be between ${template.minLimitCount} and ${template.maxLimitCount}`,
            error: "INVALID_LIMIT",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Validate task type matches template
      if (taskData.type !== template.type) {
        return new Response(
          JSON.stringify({
            message: "Task type must match template type",
            error: "TYPE_MISMATCH",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Calculate total cost for the task using safe number handling
    const rateToUser = safeNumber(taskData.rateToUser);
    if (rateToUser <= 0) {
      return new Response(
        JSON.stringify({ message: "Rate to user must be greater than 0" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const limitCount = safeNumber(taskData.limitCount);
    if (limitCount <= 0) {
      return new Response(
        JSON.stringify({ message: "Limit count must be greater than 0" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const advertiserCost = rateToUser * 1.2; // 20% platform fee
    const totalCost = advertiserCost * limitCount;

    // Sanitize text inputs
    taskData.title = sanitizeInput(taskData.title);
    taskData.description = sanitizeInput(taskData.description);

    // Payment validation for non-admin users
    let paymentDone = false;
    let paymentMethod = taskData.paymentMethod || "wallet";

    if (token.role?.toLowerCase() !== "admin") {
      // For advertisers, payment is always required and processed immediately
      // Check if payment is required (default to true unless explicitly false)
      if (taskData.requirePayment !== false) {
        if (paymentMethod === "wallet") {
          // Get user's current wallet balance
          const user = await db
            .collection("Users")
            .findOne({ email: token.email });
          const currentBalance = safeNumber(user?.walletBalance);

          console.log(
            `[TASK CREATION] Payment validation - Required: ${formatCurrencyINR(
              totalCost
            )}, Available: ${formatCurrencyINR(currentBalance)}, User Role: ${
              token.role
            }`
          );

          // For advertisers, always process payment immediately
          // For admins, only process if payNow is true
          const shouldProcessPaymentImmediately =
            token.role?.toLowerCase() === "advertiser" ||
            taskData.payNow === true;

          if (shouldProcessPaymentImmediately) {
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
                    totalUsers: limitCount,
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
              `[TASK CREATION] Payment processed immediately. New balance: ${formatCurrencyINR(
                newBalance
              )}`
            );
          }
        }
      }
    }

    // Create the task document
    const taskDoc = {
      title: taskData.title,
      type: taskData.type,
      description: taskData.description,
      proofRequirements: taskData.proofRequirements,
      rateToUser: rateToUser,
      limitCount: limitCount,
      startAt: new Date(taskData.startAt),
      endAt: new Date(taskData.endAt),
      requireKyc: taskData.requireKyc ?? false,
      status: taskData.status || "pending", // Default to pending for admin approval
      createdBy: token.email,
      gmail: token.email, // For advertiser association
      templateId: taskData.templateId || null,
      paymentDone: paymentDone,
      totalCost: totalCost,
      advertiserCost: advertiserCost,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the task into the database
    const result = await db.collection("tasks").insertOne(taskDoc);
    console.log("Task created successfully:", result.insertedId);

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Task created successfully",
        task: {
          ...taskDoc,
          _id: result.insertedId.toString(),
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Task creation error:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to create task",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
