// Modified /api/upload (added authentication and per-user folder)
import { getToken } from "next-auth/jwt";
import { v2 as cloudinary } from "cloudinary";

// Add validation for Cloudinary configuration
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("Cloudinary environment variables are not properly configured");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const documentType = formData.get("documentType");

    if (!file || !documentType) {
      return new Response(
        JSON.stringify({ error: "Missing file or document type" }),
        { status: 400 }
      );
    }

    // Validate document type
    const validDocumentTypes = ["aadhar", "pan", "selfie", "bankStatement"];
    if (!validDocumentTypes.includes(documentType)) {
      return new Response(JSON.stringify({ error: "Invalid document type" }), {
        status: 400,
      });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: "Invalid file type. Only JPG, PNG, or PDF allowed.",
        }),
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: "File size exceeds 5MB limit." }),
        { status: 400 }
      );
    }

    // Check if Cloudinary is properly configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error(
        "Cloudinary environment variables are not properly configured"
      );
      return new Response(
        JSON.stringify({
          error:
            "Upload service is not properly configured. Please contact support.",
        }),
        {
          status: 500,
        }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `kyc/${token.email}/${documentType}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(
              new Error(`Upload failed: ${error.message || "Unknown error"}`)
            );
          } else {
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });

    return new Response(
      JSON.stringify({
        url: uploadResult.secure_url,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    // Return a more user-friendly error message
    const errorMessage =
      error.message || "Failed to upload file. Please try again.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
