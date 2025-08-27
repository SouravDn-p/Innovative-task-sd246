export const runtime = "nodejs"; // 👈 এড করো

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const documentType = formData.get("documentType");

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

  return Response.json({
    url: uploadResult.secure_url,
    name: file.name,
    size: file.size,
    uploadedAt: new Date(),
  });
}
