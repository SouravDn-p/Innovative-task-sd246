import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");
    const advertiserRequestsCollection = db.collection("advertiser-requests");

    const user = await usersCollection.findOne({ email: token.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already an advertiser or has a pending request
    if (user.role === "advertiser") {
      return NextResponse.json(
        { error: "User is already an advertiser" },
        { status: 400 }
      );
    }

    const existingRequest = await advertiserRequestsCollection.findOne({
      userEmail: token.email,
      status: { $in: ["pending", "approved"] },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Advertiser request already exists" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      companyName,
      businessType,
      contactPerson,
      contactPhone,
      contactEmail,
      website,
      address,
      paymentMethod,
      businessRegistration,
      taxId,
    } = body;

    // Validate required fields
    if (
      !companyName ||
      !businessType ||
      !contactPerson ||
      !contactPhone ||
      !contactEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRequest = {
      userId: user._id.toString(),
      userEmail: token.email,
      userName: user.name,
      companyName,
      businessType,
      contactPerson,
      contactPhone,
      contactEmail,
      website: website || "",
      address: address || "",
      paymentMethod: paymentMethod || "",
      businessRegistration: businessRegistration || "",
      taxId: taxId || "",
      status: "pending",
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: "",
    };

    const result = await advertiserRequestsCollection.insertOne(newRequest);

    // Update user with pending advertiser status
    await usersCollection.updateOne(
      { email: token.email },
      {
        $set: {
          advertiserRequestStatus: "pending",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        message: "Advertiser request submitted successfully",
        requestId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Advertiser registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
