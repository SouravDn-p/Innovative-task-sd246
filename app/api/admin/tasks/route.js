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
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const taskType = searchParams.get("taskType") || "";
    const createdBy = searchParams.get("createdBy") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Build filter object
    const filter = {};

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { gmail: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Payment status filter (calculated field)
    // We'll handle this in the aggregation pipeline

    // Task type filter
    if (taskType) {
      filter.type = taskType;
    }

    // Created by filter
    if (createdBy) {
      if (createdBy === "admin") {
        filter.createdBy = "admin";
      } else if (createdBy === "advertiser") {
        filter.createdBy = { $ne: "admin" };
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Aggregation pipeline to get tasks with additional calculated fields
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "Users",
          localField: "gmail",
          foreignField: "email",
          as: "creator",
        },
      },
      {
        $lookup: {
          from: "userTasks",
          localField: "_id",
          foreignField: "taskId",
          as: "userTasks",
        },
      },
      {
        $lookup: {
          from: "taskSubmissions",
          localField: "_id",
          foreignField: "taskId",
          as: "submissions",
        },
      },
      {
        $addFields: {
          creator: { $arrayElemAt: ["$creator", 0] },
          // Calculate payment status based on creator's wallet and task cost
          paymentStatusCalc: {
            $cond: {
              if: { $eq: ["$paymentDone", true] },
              then: "paid",
              else: {
                $cond: {
                  if: {
                    $gte: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$creator.walletBalance", 0] },
                          0,
                        ],
                      },
                      { $multiply: ["$advertiserCost", "$limitCount"] },
                    ],
                  },
                  then: "paid",
                  else: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $gt: [
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: ["$creator.walletBalance", 0],
                                  },
                                  0,
                                ],
                              },
                              0,
                            ],
                          },
                          {
                            $lt: [
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: ["$creator.walletBalance", 0],
                                  },
                                  0,
                                ],
                              },
                              { $multiply: ["$advertiserCost", "$limitCount"] },
                            ],
                          },
                        ],
                      },
                      then: "partial",
                      else: {
                        $cond: {
                          if: { $eq: ["$status", "cancelled"] },
                          then: "refunded",
                          else: "unpaid",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          // Task progress
          completedCount: { $size: "$userTasks" },
          pendingSubmissions: {
            $size: {
              $filter: {
                input: "$submissions",
                as: "sub",
                cond: { $eq: ["$$sub.status", "pending"] },
              },
            },
          },
          approvedSubmissions: {
            $size: {
              $filter: {
                input: "$submissions",
                as: "sub",
                cond: { $eq: ["$$sub.status", "approved"] },
              },
            },
          },
          rejectedSubmissions: {
            $size: {
              $filter: {
                input: "$submissions",
                as: "sub",
                cond: { $eq: ["$$sub.status", "rejected"] },
              },
            },
          },
          totalSpent: {
            $multiply: [
              "$rateToUser",
              {
                $size: {
                  $filter: {
                    input: "$userTasks",
                    as: "task",
                    cond: {
                      $eq: ["$$task.paymentReceivedStatus", "completed"],
                    },
                  },
                },
              },
            ],
          },
          totalBudget: { $multiply: ["$advertiserCost", "$limitCount"] },
        },
      },
      // Filter by payment status if specified
      ...(paymentStatus
        ? [{ $match: { paymentStatusCalc: paymentStatus } }]
        : []),
      { $sort: sort },
      {
        $facet: {
          tasks: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
          statistics: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
                runningTasks: {
                  $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
                },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                pausedTasks: {
                  $sum: { $cond: [{ $eq: ["$status", "paused"] }, 1, 0] },
                },
                totalBudgetLocked: { $sum: "$totalBudget" },
                totalAmountSpent: { $sum: "$totalSpent" },
                pendingPayments: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatusCalc", "unpaid"] },
                      "$totalBudget",
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ];

    const result = await db.collection("tasks").aggregate(pipeline).toArray();
    const data = result[0];

    const tasks = data.tasks.map((task) => ({
      ...task,
      _id: task._id.toString(),
      creator: task.creator
        ? {
            ...task.creator,
            _id: task.creator._id.toString(),
          }
        : null,
    }));

    const totalCount = data.totalCount[0]?.count || 0;
    const statistics = data.statistics[0] || {
      totalTasks: 0,
      pendingTasks: 0,
      runningTasks: 0,
      completedTasks: 0,
      pausedTasks: 0,
      totalBudgetLocked: 0,
      totalAmountSpent: 0,
      pendingPayments: 0,
    };

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit,
      },
      statistics,
      filters: {
        search,
        status,
        paymentStatus,
        taskType,
        createdBy,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Admin tasks fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate required fields
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

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate task type
    const validTypes = [
      "video",
      "install",
      "share",
      "review",
      "social",
      "custom",
    ];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid task type" }, { status: 400 });
    }

    // Validate dates
    if (new Date(body.startAt) >= new Date(body.endAt)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    const task = {
      ...body,
      rateToUser: parseFloat(body.rateToUser),
      advertiserCost: parseFloat(body.rateToUser) * 1.2,
      limitCount: parseInt(body.limitCount),
      completedCount: 0,
      status: "approved", // Admin-created tasks are auto-approved
      createdBy: "admin",
      gmail: token.email,
      name: token.name || "Admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentDone: false,
    };

    const result = await db.collection("tasks").insertOne(task);

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "create_task",
      adminEmail: token.email,
      targetTaskId: result.insertedId.toString(),
      details: {
        title: task.title,
        type: task.type,
        rateToUser: task.rateToUser,
        limitCount: task.limitCount,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Task created successfully",
      task: {
        ...task,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Admin create task error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
