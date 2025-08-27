export const runtime = "nodejs";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `kyc/${documentType}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return new Response(
      JSON.stringify({
        url: uploadResult.secure_url,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Failed to upload file" }), {
      status: 500,
    });
  }
}
