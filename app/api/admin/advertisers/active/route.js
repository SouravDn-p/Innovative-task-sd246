import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");

    // Verify admin role
    const adminUser = await usersCollection.findOne({ email: token.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";

    // Build filter for advertisers
    const filter = { role: "advertiser" };

    if (search) {
      filter.$or = [
        { "advertiserProfile.companyName": { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Get advertisers with pagination
    const advertisers = await usersCollection
      .find(filter)
      .sort({ "advertiserProfile.approvedAt": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalAdvertisers = await usersCollection.countDocuments(filter);

    // Enrich with task and performance data
    const enrichedAdvertisers = await Promise.all(
      advertisers.map(async (advertiser) => {
        // Get task statistics
        const tasksCollection = db.collection("Tasks");
        const advertiserTasks = await tasksCollection
          .find({
            advertiserId: advertiser._id.toString(),
          })
          .toArray();

        const activeTasks = advertiserTasks.filter((task) =>
          ["active", "pending", "approved"].includes(task.status)
        ).length;

        const completedTasks = advertiserTasks.filter(
          (task) => task.status === "completed"
        ).length;

        // Calculate total expenses (sum of task budgets)
        const totalExpense = advertiserTasks.reduce((sum, task) => {
          return sum + (task.budget || 0);
        }, 0);

        return {
          _id: advertiser._id.toString(),
          name: advertiser.name,
          email: advertiser.email,
          phone: advertiser.phone,
          companyName: advertiser.advertiserProfile?.companyName || "",
          approvedAt: advertiser.advertiserProfile?.approvedAt || null,
          totalTasks: advertiserTasks.length,
          activeTasks,
          completedTasks,
          totalExpense,
          performanceScore: advertiser.advertiserProfile?.performanceScore || 0,
          joinDate: advertiser.createdAt
            ? new Date(advertiser.createdAt).toISOString().split("T")[0]
            : null,
          isSuspended: advertiser.isSuspended || false,
        };
      })
    );

    return NextResponse.json({
      advertisers: enrichedAdvertisers,
      pagination: {
        page,
        limit,
        totalAdvertisers,
        totalPages: Math.ceil(totalAdvertisers / limit),
        hasNext: page * limit < totalAdvertisers,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Admin active advertisers fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
