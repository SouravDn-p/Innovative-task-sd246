import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const users = db.collection("Users");

    const user = await users.findOne(
      { email: token.email },
      {
        projection: {
          password: 0, // Exclude sensitive fields
        },
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate additional profile stats
    const userTasks = await db
      .collection("userTasks")
      .find({ userEmail: token.email })
      .toArray();
    const taskSubmissions = await db
      .collection("taskSubmissions")
      .find({ userEmail: token.email })
      .toArray();

    const profileData = {
      ...user,
      _id: user._id.toString(),
      // Profile statistics
      tasksCompleted: userTasks.filter(
        (task) =>
          task.status === "completed" ||
          task.paymentReceivedStatus === "completed"
      ).length,
      pendingTasks: userTasks.filter((task) => task.status === "pending")
        .length,
      activeTasks: userTasks.filter((task) => task.status === "active").length,
      totalSubmissions: taskSubmissions.length,
      approvedSubmissions: taskSubmissions.filter(
        (sub) => sub.status === "approved"
      ).length,
      rejectedSubmissions: taskSubmissions.filter(
        (sub) => sub.status === "rejected"
      ).length,
      // Referral statistics
      totalReferrals: user.Recent_Referrals?.length || 0,
      // Format dates
      joinDate: user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : null,
      lastUpdated: user.updatedAt
        ? new Date(user.updatedAt).toISOString()
        : null,
    };

    return NextResponse.json({ profile: profileData });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Define allowed profile fields for update
    const allowedFields = [
      "name",
      "phone",
      "dateOfBirth",
      "image",
      "bio",
      "location",
      "website",
      "department",
      "gender",
      "address",
      "city",
      "state",
      "pincode",
      "emergencyContact",
    ];

    const updateFields = {};

    // Validate and sanitize input fields
    allowedFields.forEach((field) => {
      if (body[field] !== undefined && body[field] !== null) {
        // Basic validation
        if (field === "email") {
          // Email cannot be changed through profile update
          return;
        }
        if (field === "phone" && body[field]) {
          // Basic phone validation
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(body[field].replace(/[\s\-\(\)]/g, ""))) {
            throw new Error("Invalid phone number format");
          }
        }
        if (field === "dateOfBirth" && body[field]) {
          // Date validation
          const date = new Date(body[field]);
          const now = new Date();
          if (date > now || date < new Date("1900-01-01")) {
            throw new Error("Invalid date of birth");
          }
        }
        updateFields[field] = body[field];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    updateFields.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const users = db.collection("Users");

    const result = await users.updateOne(
      { email: token.email },
      { $set: updateFields },
      { upsert: false }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes made or user not found" },
        { status: 404 }
      );
    }

    // Return updated profile data
    const updatedUser = await users.findOne(
      { email: token.email },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: {
        ...updatedUser,
        _id: updatedUser._id.toString(),
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
