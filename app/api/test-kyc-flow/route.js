import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = client.db("TaskEarnDB");
    const kycApplicationsCollection = db.collection("kyc-applications");

    // Get the user's KYC application
    const kycApplication = await kycApplicationsCollection.findOne({
      userEmail: token.email,
    });

    return new Response(
      JSON.stringify({
        message: "KYC Flow Test",
        kycApplication,
        userEmail: token.email,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Test error:", error);
    return new Response(JSON.stringify({ error: "Test failed" }), {
      status: 500,
    });
  }
}
