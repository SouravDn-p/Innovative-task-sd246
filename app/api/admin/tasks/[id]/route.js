import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const { id: taskId } = await params;
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

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Find task by ID
    let task;
    if (ObjectId.isValid(taskId)) {
      task = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) });
    } else {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get task creator/advertiser information
    const creator = await db
      .collection("Users")
      .findOne({ email: task.gmail }, { projection: { password: 0 } });

    // Get all user tasks for this task
    const userTasks = await db
      .collection("userTasks")
      .find({ taskId: new ObjectId(taskId) })
      .toArray();

    // Get all submissions for this task
    const submissions = await db
      .collection("taskSubmissions")
      .find({ taskId: new ObjectId(taskId) })
      .sort({ submittedAt: -1 })
      .toArray();

    // Get user information for submissions
    const userEmails = submissions.map((sub) => sub.userEmail);
    const submissionUsers = await db
      .collection("Users")
      .find(
        { email: { $in: userEmails } },
        { projection: { password: 0, walletBalance: 0 } }
      )
      .toArray();

    const userMap = submissionUsers.reduce((map, user) => {
      map[user.email] = user;
      return map;
    }, {});

    // Enhanced submissions with user data and fraud detection
    const enhancedSubmissions = submissions.map((submission) => {
      const user = userMap[submission.userEmail] || {};
      const userTask = userTasks.find(
        (ut) => ut.userEmail === submission.userEmail
      );

      return {
        ...submission,
        _id: submission._id.toString(),
        user: {
          name: user.name || "Unknown User",
          email: user.email,
          image: user.image,
          kycStatus: user.kycStatus || "none",
          joinDate: user.createdAt,
          totalEarnings: user.totalEarn || 0,
        },
        userTask: userTask
          ? {
              ...userTask,
              _id: userTask._id.toString(),
            }
          : null,
        // Fraud detection flags
        fraudFlags: {
          duplicateProof: false, // Will be calculated
          suspiciousDevice: false, // Will be calculated
          rapidSubmission: false, // Will be calculated
          riskScore: 0, // Will be calculated
        },
      };
    });

    // Calculate task statistics
    const stats = {
      totalAssigned: userTasks.length,
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter((s) => s.status === "pending")
        .length,
      approvedSubmissions: submissions.filter((s) => s.status === "approved")
        .length,
      rejectedSubmissions: submissions.filter((s) => s.status === "rejected")
        .length,
      completedTasks: userTasks.filter(
        (ut) => ut.paymentReceivedStatus === "completed"
      ).length,
      activeTasks: userTasks.filter((ut) => ut.status === "active").length,
      pendingTasks: userTasks.filter((ut) => ut.status === "pending").length,
    };

    // Calculate payment information
    const creatorWallet = creator?.walletBalance || 0;
    const totalBudgetRequired = task.advertiserCost * task.limitCount;
    const totalSpent =
      task.rateToUser *
      userTasks.filter((ut) => ut.paymentReceivedStatus === "completed").length;
    const remainingBudget = totalBudgetRequired - totalSpent;

    let paymentStatus = "unpaid";
    if (task.paymentDone) {
      paymentStatus = "paid";
    } else if (creatorWallet >= totalBudgetRequired) {
      paymentStatus = "paid";
    } else if (creatorWallet > 0 && creatorWallet < totalBudgetRequired) {
      paymentStatus = "partial";
    } else if (task.status === "cancelled") {
      paymentStatus = "refunded";
    }

    const paymentInfo = {
      status: paymentStatus,
      totalBudgetRequired,
      totalSpent,
      remainingBudget,
      creatorWalletBalance: creatorWallet,
      canContinue: creatorWallet >= task.advertiserCost,
      rateToUser: task.rateToUser,
      advertiserCost: task.advertiserCost,
      expectedUsers: task.limitCount,
      actualUsers: stats.totalAssigned,
      completedUsers: stats.completedTasks,
    };

    // Task progress
    const progress = {
      completed: stats.completedTasks,
      limit: task.limitCount,
      percentage:
        task.limitCount > 0
          ? (stats.completedTasks / task.limitCount) * 100
          : 0,
      isCompleted: stats.completedTasks >= task.limitCount,
      canAcceptMore:
        stats.totalAssigned < task.limitCount && task.status === "approved",
    };

    // Recent admin actions on this task
    const adminActions = await db
      .collection("adminActions")
      .find({ targetTaskId: taskId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    // Format response
    const response = {
      task: {
        ...task,
        _id: task._id.toString(),
      },
      creator: creator
        ? {
            ...creator,
            _id: creator._id.toString(),
          }
        : null,
      statistics: stats,
      paymentInfo,
      progress,
      submissions: enhancedSubmissions,
      userTasks: userTasks.map((ut) => ({
        ...ut,
        _id: ut._id.toString(),
      })),
      adminActions: adminActions.map((action) => ({
        ...action,
        _id: action._id.toString(),
      })),
      // Audit information
      auditInfo: {
        flaggedSubmissions: enhancedSubmissions.filter(
          (s) => s.fraudFlags.riskScore > 70
        ).length,
        suspiciousUsers: new Set(
          enhancedSubmissions
            .filter((s) => s.fraudFlags.riskScore > 50)
            .map((s) => s.userEmail)
        ).size,
        duplicateProofs: 0, // Will be calculated in fraud detection
        deviceConflicts: 0, // Will be calculated in fraud detection
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin task details error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id: taskId } = await params;
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

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Find task
    let task;
    if (ObjectId.isValid(taskId)) {
      task = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) });
    } else {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Define allowed update fields
    const allowedFields = [
      "title",
      "description",
      "proofRequirements",
      "rateToUser",
      "limitCount",
      "startAt",
      "endAt",
      "requireKyc",
      "status",
      "type",
    ];

    const updateFields = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    });

    // Recalculate advertiser cost if rateToUser changed
    if (updateFields.rateToUser) {
      updateFields.rateToUser = parseFloat(updateFields.rateToUser);
      updateFields.advertiserCost = updateFields.rateToUser * 1.2;
    }

    // Parse limitCount if provided
    if (updateFields.limitCount) {
      updateFields.limitCount = parseInt(updateFields.limitCount);
    }

    // Validate dates if provided
    if (updateFields.startAt && updateFields.endAt) {
      if (new Date(updateFields.startAt) >= new Date(updateFields.endAt)) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    updateFields.updatedAt = new Date().toISOString();

    // Update task
    const result = await db
      .collection("tasks")
      .updateOne({ _id: new ObjectId(taskId) }, { $set: updateFields });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Task not found or no changes made" },
        { status: 404 }
      );
    }

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "update_task",
      adminEmail: token.email,
      targetTaskId: taskId,
      details: {
        updatedFields: Object.keys(updateFields),
        changes: updateFields,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Task updated successfully",
      updatedFields: Object.keys(updateFields),
    });
  } catch (error) {
    console.error("Admin task update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id: taskId } = await params;
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

    const { reason, confirmDelete } = body;

    if (!confirmDelete) {
      return NextResponse.json(
        { error: "Delete confirmation is required" },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Deletion reason is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Find task
    let task;
    if (ObjectId.isValid(taskId)) {
      task = await db
        .collection("tasks")
        .findOne({ _id: new ObjectId(taskId) });
    } else {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if task has active user assignments
    const activeUserTasks = await db.collection("userTasks").countDocuments({
      taskId: new ObjectId(taskId),
      status: "active",
    });

    const pendingSubmissions = await db
      .collection("taskSubmissions")
      .countDocuments({
        taskId: new ObjectId(taskId),
        status: "pending",
      });

    if (activeUserTasks > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete task with ${activeUserTasks} active assignments. Please complete or cancel user tasks first.`,
        },
        { status: 400 }
      );
    }

    if (pendingSubmissions > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete task with ${pendingSubmissions} pending submissions. Please review all submissions first.`,
        },
        { status: 400 }
      );
    }

    // Create deletion record
    const deletionRecord = {
      deletedTask: {
        ...task,
        _id: task._id.toString(),
      },
      deletedBy: token.email,
      deletionReason: reason,
      deletedAt: new Date(),
    };

    await db.collection("deletedTasks").insertOne(deletionRecord);

    // Log admin action
    await db.collection("adminActions").insertOne({
      action: "delete_task",
      adminEmail: token.email,
      targetTaskId: taskId,
      details: {
        reason,
        title: task.title,
        type: task.type,
        totalBudget: task.advertiserCost * task.limitCount,
        assignedUsers: activeUserTasks,
      },
      timestamp: new Date(),
    });

    // Delete related data
    const deletionPromises = [
      // Delete task document
      db.collection("tasks").deleteOne({ _id: new ObjectId(taskId) }),

      // Delete user tasks
      db.collection("userTasks").deleteMany({ taskId: new ObjectId(taskId) }),

      // Delete task submissions
      db
        .collection("taskSubmissions")
        .deleteMany({ taskId: new ObjectId(taskId) }),
    ];

    await Promise.all(deletionPromises);

    return NextResponse.json({
      message: "Task deleted successfully",
      deletedTask: {
        id: taskId,
        title: task.title,
        deletedAt: new Date(),
        reason,
      },
    });
  } catch (error) {
    console.error("Admin delete task error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
