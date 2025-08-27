import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongoClient";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File validation function
function validateFile(file, documentType) {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type for ${documentType}. Only JPEG, PNG, or PDF allowed.`;
  }
  if (file.size > maxSize) {
    return `File size exceeds 5MB for ${documentType}.`;
  }
  return null;
}

// Calculate completion percentage
function calculateCompletionPercentage(documents) {
  const requiredDocs = ["aadhar", "pan", "selfie"];
  const uploadedRequired = requiredDocs.filter(
    (doc) => documents[doc]?.uploaded
  ).length;
  const optionalUploaded = documents.bankStatement?.uploaded ? 1 : 0;
  return Math.round(
    ((uploadedRequired + optionalUploaded) / (requiredDocs.length + 1)) * 100
  );
}

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ email: token.email });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const kycData = {
      status: user.kycStatus || "none",
      submittedAt: user.kycSubmittedAt || null,
      reviewedAt: user.kycReviewedAt || null,
      documents: user.kycDocuments || {
        aadhar: {
          uploaded: false,
          status: "not_uploaded",
          url: null,
          name: null,
          size: null,
          uploadedAt: null,
        },
        pan: {
          uploaded: false,
          status: "not_uploaded",
          url: null,
          name: null,
          size: null,
          uploadedAt: null,
        },
        selfie: {
          uploaded: false,
          status: "not_uploaded",
          url: null,
          name: null,
          size: null,
          uploadedAt: null,
        },
        bankStatement: {
          uploaded: false,
          status: "not_uploaded",
          url: null,
          name: null,
          size: null,
          uploadedAt: null,
        },
      },
      paymentStatus: user.kycPaymentStatus || "not_paid",
      paymentAmount: 99,
      rejectionReason: user.kycRejectionReason || null,
      completionPercentage: user.kycCompletionPercentage || 0,
    };

    return new Response(JSON.stringify(kycData), { status: 200 });
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const formData = await req.formData();
    const documentType = formData.get("documentType");
    const file = formData.get("file");
    const paymentStatus = formData.get("paymentStatus");

    if (!documentType && !paymentStatus) {
      return new Response(
        JSON.stringify({ message: "Missing documentType or paymentStatus" }),
        {
          status: 400,
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");

    let updateFields = {};

    // Handle file upload
    if (file && documentType) {
      // Validate document type
      const validDocumentTypes = ["aadhar", "pan", "selfie", "bankStatement"];
      if (!validDocumentTypes.includes(documentType)) {
        return new Response(
          JSON.stringify({ message: "Invalid document type" }),
          {
            status: 400,
          }
        );
      }

      // Validate file
      const validationError = validateFile(file, documentType);
      if (validationError) {
        return new Response(JSON.stringify({ message: validationError }), {
          status: 400,
        });
      }

      // Upload to Cloudinary
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `kyc/${token.email}/${documentType}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      const documentData = {
        uploaded: true,
        status: "pending",
        url: uploadResult.secure_url,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      };

      updateFields = {
        kycDocuments: {
          [documentType]: documentData,
        },
        kycStatus: "pending",
        kycSubmittedAt: new Date(),
        kycCompletionPercentage: 0, // Will be recalculated
      };
    }

    // Handle payment status update
    if (paymentStatus) {
      if (paymentStatus !== "paid") {
        return new Response(
          JSON.stringify({ message: "Invalid payment status" }),
          {
            status: 400,
          }
        );
      }
      updateFields.kycPaymentStatus = paymentStatus;
    }

    // Fetch current user data to merge documents
    const user = await usersCollection.findOne({ email: token.email });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Merge existing documents with new document
    const updatedDocuments = {
      ...user.kycDocuments,
      ...updateFields.kycDocuments,
    };

    updateFields.kycDocuments = updatedDocuments;
    updateFields.kycCompletionPercentage =
      calculateCompletionPercentage(updatedDocuments);

    // Update user in MongoDB
    const updateResult = await usersCollection.updateOne(
      { email: token.email },
      { $set: updateFields }
    );

    if (updateResult.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Failed to update KYC data" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        message: file
          ? `${documentType} uploaded successfully`
          : "KYC data updated successfully",
        documentType,
        kycData: {
          ...updateFields,
          documents: updatedDocuments,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing KYC data:", error);
    return new Response(
      JSON.stringify({ message: error.message || "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
