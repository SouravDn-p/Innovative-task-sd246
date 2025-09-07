import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { migrateTasks } from "@/lib/migrateTasks";

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

    // Run the migration
    const result = await migrateTasks();

    if (result.success) {
      return NextResponse.json({
        message: "Tasks migration completed successfully",
        result,
      });
    } else {
      return NextResponse.json(
        {
          error: "Migration failed",
          details: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Migration API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
