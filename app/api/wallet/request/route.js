import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a regular user or advertiser
    if (token.role !== "user" && token.role !== "advertiser") {
      return NextResponse.json(
        { error: "Forbidden: User or Advertiser access required" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const amount = formData.get("amount");
    const description = formData.get("description");
    const proofImage = formData.get("proofImage");
    const userType = formData.get("userType");

    // Validate inputs
    if (!amount || !description || !proofImage || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (userType !== "user" && userType !== "advertiser") {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    // Validate file type
    if (!proofImage.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (proofImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");

    // Get user information
    const user = await db.collection("Users").findOne({ email: token.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upload proof image to Cloudinary
    const buffer = Buffer.from(await proofImage.arrayBuffer());
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `wallet-requests/${token.email}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // Create wallet request record
    const walletRequest = {
      userId: user._id,
      userEmail: token.email,
      userName: user.name || "N/A",
      userType: userType,
      amount: amountFloat,
      description: description,
      proofImageUrl: uploadResult.secure_url,
      proofImagePublicId: uploadResult.public_id,
      status: "pending", // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert wallet request into database
    const result = await db
      .collection("walletRequests")
      .insertOne(walletRequest);

    // Create notification for admin
    const notification = {
      type: "wallet_request",
      title: "New Wallet Funding Request",
      message: `${
        user.name || user.email
      } has requested ₹${amountFloat} to be added to their wallet.`,
      userId: user._id,
      userEmail: token.email,
      relatedId: result.insertedId,
      read: false,
      createdAt: new Date(),
    };

    await db.collection("adminNotifications").insertOne(notification);

    return NextResponse.json({
      message: "Wallet request submitted successfully",
      requestId: result.insertedId,
    });
  } catch (error) {
    console.error("Wallet request error:", error);
    return NextResponse.json(
      { error: "Failed to submit wallet request" },
      { status: 500 }
    );
  }
}
