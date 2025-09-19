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

    // Check if user is a regular user
    if (token.role !== "user") {
      return NextResponse.json(
        { error: "Forbidden: User access required" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const amount = formData.get("amount");
    const method = formData.get("method");
    const upiId = formData.get("upiId");
    const bankAccount = formData.get("bankAccount");
    const ifscCode = formData.get("ifscCode");
    const accountHolder = formData.get("accountHolder");
    const notes = formData.get("notes");
    const proofImage = formData.get("proofImage");

    // Validate inputs
    if (!amount || !method || !proofImage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Validate withdrawal method
    if (method !== "upi" && method !== "bank") {
      return NextResponse.json({ error: "Invalid withdrawal method" }, { status: 400 });
    }

    if (method === "upi" && !upiId) {
      return NextResponse.json({ error: "UPI ID is required for UPI withdrawals" }, { status: 400 });
    }

    if (method === "bank" && (!bankAccount || !ifscCode || !accountHolder)) {
      return NextResponse.json({ error: "Bank details are required for bank transfers" }, { status: 400 });
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

    // Check if user has sufficient balance
    if (user.walletBalance < amountFloat) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // Upload proof image to Cloudinary
    const buffer = Buffer.from(await proofImage.arrayBuffer());
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `withdrawal-requests/${token.email}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // Create withdrawal request record
    const withdrawalRequest = {
      userId: user._id,
      userEmail: token.email,
      userName: user.name || "N/A",
      amount: amountFloat,
      method: method,
      upiId: method === "upi" ? upiId : undefined,
      bankAccount: method === "bank" ? bankAccount : undefined,
      ifscCode: method === "bank" ? ifscCode : undefined,
      accountHolder: method === "bank" ? accountHolder : undefined,
      notes: notes || "",
      proofImageUrl: uploadResult.secure_url,
      proofImagePublicId: uploadResult.public_id,
      status: "pending", // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert withdrawal request into database
    const result = await db
      .collection("withdrawalRequests")
      .insertOne(withdrawalRequest);

    // Create notification for admin
    const notification = {
      type: "withdrawal_request",
      title: "New Withdrawal Request",
      message: `${user.name || user.email} has requested to withdraw ₹${amountFloat} from their wallet.`,
      userId: user._id,
      userEmail: token.email,
      relatedId: result.insertedId,
      read: false,
      createdAt: new Date(),
    };

    await db.collection("adminNotifications").insertOne(notification);

    return NextResponse.json({
      message: "Withdrawal request submitted successfully",
      requestId: result.insertedId,
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json(
      { error: "Failed to submit withdrawal request" },
      { status: 500 }
    );
  }
}