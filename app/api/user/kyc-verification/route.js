import { getToken } from "next-auth/jwt";
import client from "@/lib/mongoClient";
import { v2 as cloudinary } from "cloudinary";
import { ObjectId } from "mongodb";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File validation function
function validateFile(file, documentType) {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  const maxSize = 5 * 1024 * 1024;
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
  const allDocs = ["aadhar", "pan", "selfie", "bankStatement"];
  const uploadedCount = allDocs.filter(
    (doc) => documents[doc]?.uploaded || documents[doc]?.url
  ).length;
  return Math.round((uploadedCount / allDocs.length) * 100);
}

// Create or update KYC application in separate collection
async function createOrUpdateKycApplication(
  db,
  userEmail,
  userData,
  documentUpdate = null,
  session = null
) {
  const kycApplicationsCollection = db.collection("kyc-applications");
  const usersCollection = db.collection("Users");

  // Find existing application
  let existingApplication = await kycApplicationsCollection.findOne(
    {
      userEmail,
    },
    { session }
  );

  if (!existingApplication) {
    // Create new application
    const newApplication = {
      userEmail,
      userId: userData._id,
      userName: userData.name || "N/A",
      phone: userData.phone || "N/A",
      status: "none",
      submittedAt: null,
      documents: {
        aadhar: {
          uploaded: false,
          status: "not_uploaded",
          url: null,
          uploadedAt: null,
        },
        pan: {
          uploaded: false,
          status: "not_uploaded",
          url: null,
          uploadedAt: null,
        },
        selfie: {
          uploaded: false,
          status: "not_uploaded",
          url: null,
          uploadedAt: null,
        },
        bankStatement: {
          uploaded: false,
          status: "not_uploaded",
          url: null,
          uploadedAt: null,
        },
      },
      paymentStatus: userData.kycPaymentStatus || "not_paid",
      completionPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Apply document update if provided
    if (documentUpdate) {
      newApplication.documents[documentUpdate.type] = documentUpdate.data;
      newApplication.completionPercentage = calculateCompletionPercentage(
        newApplication.documents
      );
    }

    const result = await kycApplicationsCollection.insertOne(newApplication, {
      session,
    });

    return { ...newApplication, _id: result.insertedId };
  } else {
    // Update existing application
    const updates = {
      updatedAt: new Date(),
    };

    if (documentUpdate) {
      updates[`documents.${documentUpdate.type}`] = documentUpdate.data;
      // Recalculate completion percentage
      const updatedDocuments = {
        ...existingApplication.documents,
        [documentUpdate.type]: documentUpdate.data,
      };
      updates.completionPercentage =
        calculateCompletionPercentage(updatedDocuments);
    }

    // Update payment status if provided
    if (userData.kycPaymentStatus) {
      updates.paymentStatus = userData.kycPaymentStatus;
    }

    await kycApplicationsCollection.updateOne(
      { userEmail },
      { $set: updates },
      { session }
    );

    return { ...existingApplication, ...updates };
  }
}

export async function POST(req) {
  let session;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount <= maxRetries) {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token || !token.email) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
        });
      }

      // Initialize variables
      let documentType = null;
      let file = null;
      let url = null;
      let name = null;
      let size = null;
      let uploadedAt = null;
      let paymentStatus = null;
      let submitForReview = null;

      // Try to parse as FormData first (for file uploads)
      try {
        const formData = await req.formData();
        documentType = formData.get("documentType");
        file = formData.get("file");
        paymentStatus = formData.get("paymentStatus");
        submitForReview = formData.get("submitForReview");
      } catch (formDataError) {
        // If FormData parsing fails, try JSON (for URL or other updates)
        try {
          const jsonBody = await req.json();
          documentType = jsonBody.documentType || null;
          url = jsonBody.url || null;
          name = jsonBody.name || null;
          size = jsonBody.size || null;
          uploadedAt = jsonBody.uploadedAt || null;
          paymentStatus = jsonBody.paymentStatus || null;
          submitForReview = jsonBody.submitForReview || null;
        } catch (jsonError) {
          return new Response(
            JSON.stringify({
              message: "Invalid request format. Expected FormData or JSON.",
            }),
            { status: 400 }
          );
        }
      }

      if (!documentType && !paymentStatus && !submitForReview) {
        return new Response(
          JSON.stringify({
            message: "Missing documentType, paymentStatus, or submitForReview",
          }),
          { status: 400 }
        );
      }

      const db = client.db("TaskEarnDB");
      const usersCollection = db.collection("Users");

      session = client.startSession();
      session.startTransaction();

      const user = await usersCollection.findOne(
        { email: token.email },
        { session }
      );
      if (!user) {
        await session.abortTransaction();
        return new Response(JSON.stringify({ message: "User not found" }), {
          status: 404,
        });
      }

      let documentUpdate = null;
      let updateFields = {};

      // Handle document update (either from file or from provided URL)
      if (documentType) {
        const validDocumentTypes = ["aadhar", "pan", "selfie", "bankStatement"];
        if (!validDocumentTypes.includes(documentType)) {
          await session.abortTransaction();
          return new Response(
            JSON.stringify({ message: "Invalid document type" }),
            { status: 400 }
          );
        }

        if (file) {
          // Existing file upload logic
          const validationError = validateFile(file, documentType);
          if (validationError) {
            await session.abortTransaction();
            return new Response(JSON.stringify({ message: validationError }), {
              status: 400,
            });
          }

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

          documentUpdate = {
            type: documentType,
            data: {
              uploaded: true,
              status: "uploaded",
              url: uploadResult.secure_url,
              name: file.name,
              size: file.size,
              uploadedAt: new Date(),
            },
          };
        } else if (url) {
          // New logic for pre-uploaded URL (from /api/upload)
          documentUpdate = {
            type: documentType,
            data: {
              uploaded: true,
              status: "uploaded",
              url,
              name: name || `${documentType}_document`,
              size: size || 0,
              uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
            },
          };
        } else {
          await session.abortTransaction();
          return new Response(
            JSON.stringify({ message: "Missing file or URL for document" }),
            { status: 400 }
          );
        }

        updateFields[`kycDocuments.${documentType}`] = documentUpdate.data;
      }

      // Handle payment status update
      if (paymentStatus) {
        if (paymentStatus !== "paid") {
          await session.abortTransaction();
          return new Response(
            JSON.stringify({ message: "Invalid payment status" }),
            { status: 400 }
          );
        }
        updateFields.kycPaymentStatus = paymentStatus;

        // Create wallet transaction for KYC payment
        // Check if user has a referrer to determine how to split the payment
        let kycPaymentAmount = 99; // Default KYC fee
        let websiteCredit = 99; // Default to full amount to website
        let referrerCredit = 0; // Default to no referrer credit

        if (user.referrerId) {
          // If user has a referrer, split the payment
          websiteCredit = 50; // Rs.50 to website
          referrerCredit = 49; // Rs.49 to referrer
        }
        // If no referrer, full amount (Rs.99) goes to website

        // Create wallet transaction for KYC payment to website
        await db.collection("walletTransactions").insertOne(
          {
            userEmail: token.email,
            userId: user._id,
            type: "debit",
            amount: kycPaymentAmount,
            description: "KYC verification fee",
            reference: `KYC_PAYMENT_${Date.now()}`,
            balanceBefore: user.walletBalance || 0,
            balanceAfter: (user.walletBalance || 0) - kycPaymentAmount,
            adminAction: false,
            createdAt: new Date(),
          },
          { session }
        );

        // If user has a referrer, create transaction for referrer reward
        if (user.referrerId && referrerCredit > 0) {
          // Find referrer
          const referrer = await usersCollection.findOne(
            { _id: new ObjectId(user.referrerId) },
            { session }
          );

          if (referrer) {
            // Create wallet transaction for referrer reward
            await db.collection("walletTransactions").insertOne(
              {
                userEmail: referrer.email,
                userId: referrer._id,
                type: "credit",
                amount: referrerCredit,
                description: `Referral reward for ${
                  user.name || user.email
                } KYC verification`,
                reference: `REFERRAL_REWARD_${Date.now()}`,
                balanceBefore: referrer.walletBalance || 0,
                balanceAfter: (referrer.walletBalance || 0) + referrerCredit,
                adminAction: false,
                createdAt: new Date(),
              },
              { session }
            );
          }
        }
      }

      // Create or update KYC application
      const kycApplication = await createOrUpdateKycApplication(
        db,
        token.email,
        { ...user, kycPaymentStatus: paymentStatus || user.kycPaymentStatus },
        documentUpdate,
        session
      );

      if (Object.keys(updateFields).length > 0) {
        updateFields.updatedAt = new Date();
        await usersCollection.updateOne(
          { email: token.email },
          { $set: updateFields },
          { session }
        );
      }

      // Handle submission
      if (submitForReview === "true") {
        const allDocs = ["aadhar", "pan", "selfie", "bankStatement"];
        const currentDocs = kycApplication.documents;
        const missingDocs = allDocs.filter(
          (doc) => !currentDocs[doc]?.uploaded && !currentDocs[doc]?.url
        );

        if (missingDocs.length > 0) {
          await session.abortTransaction();
          return new Response(
            JSON.stringify({
              message: `Missing required documents: ${missingDocs.join(", ")}`,
              missingDocuments: missingDocs,
            }),
            { status: 400 }
          );
        }

        if (kycApplication.paymentStatus !== "paid") {
          await session.abortTransaction();
          return new Response(
            JSON.stringify({
              message: "Payment is required before submitting for review",
              paymentRequired: true,
            }),
            { status: 400 }
          );
        }

        await db.collection("kyc-applications").updateOne(
          { userEmail: token.email },
          {
            $set: {
              status: "pending",
              submittedAt: new Date(),
              readyForReview: true,
            },
          },
          { session }
        );

        await usersCollection.updateOne(
          { email: token.email },
          {
            $set: {
              kycStatus: "pending",
              kycSubmittedAt: new Date(),
            },
          },
          { session }
        );

        // Check if user was referred and award Rs.49 to referrer upon KYC completion
        if (user.referrerId) {
          const referrer = await usersCollection.findOne(
            { _id: new ObjectId(user.referrerId) },
            { session }
          );

          if (referrer) {
            // Award Rs.49 to referrer
            const referralReward = 49;

            // Check if referral entry already exists for this user using referredUserId or email
            const existingReferralIndex = referrer.Recent_Referrals?.findIndex(
              (referral) =>
                referral.referredUserId === user._id.toString() ||
                referral.email === (user.email || "no-email")
            );

            if (
              existingReferralIndex !== -1 &&
              existingReferralIndex !== undefined
            ) {
              // Update existing referral entry
              const updatedReferrals = [...referrer.Recent_Referrals];
              updatedReferrals[existingReferralIndex] = {
                ...updatedReferrals[existingReferralIndex],
                kycStatus: "Verified",
                earned: `₹${referralReward}`,
                referralDate: new Date().toISOString(), // This will be the verified date
                status: user.isSuspended ? "Suspended" : "Active",
              };

              // Update referrer's wallet and referral records
              await usersCollection.updateOne(
                { _id: new ObjectId(user.referrerId) },
                {
                  $set: {
                    Recent_Referrals: updatedReferrals,
                    updatedAt: new Date().toISOString(),
                  },
                  $inc: {
                    walletBalance: referralReward,
                    totalReferralsCount: 0, // Don't increment since we're updating existing
                    dailyReferralsCount: 1,
                  },
                },
                { session }
              );
            } else {
              // Create new referral entry (fallback if no existing entry found)
              const referralEntry = {
                name: user.name || "Unknown",
                email: user.email || "no-email",
                joinDate: user.createdAt || new Date().toISOString(),
                referralDate: new Date().toISOString(),
                status: user.isSuspended ? "Suspended" : "Active",
                kycStatus: "Verified",
                earned: `₹${referralReward}`,
                referredUserId: user._id.toString(), // Store the referred user's ID
              };

              // Update referrer's wallet and referral records
              await usersCollection.updateOne(
                { _id: new ObjectId(user.referrerId) },
                {
                  $inc: {
                    walletBalance: referralReward,
                    totalReferralsCount: 1,
                    dailyReferralsCount: 1,
                  },
                  $push: {
                    Recent_Referrals: {
                      $each: [referralEntry],
                      $slice: -10, // Keep only latest 10 referrals
                    },
                  },
                  $set: { updatedAt: new Date().toISOString() },
                },
                { session }
              );
            }

            // Add transaction to wallet history
            await db.collection("walletTransactions").insertOne(
              {
                userId: new ObjectId(user.referrerId),
                type: "credit",
                amount: referralReward,
                description: `Referral reward for ${user.name || user.email}`,
                timestamp: new Date(),
              },
              { session }
            );
          }
        }
      }

      await session.commitTransaction();

      const responseMessage = documentType
        ? `${documentType} uploaded successfully`
        : submitForReview === "true"
        ? "KYC application submitted for review successfully"
        : "KYC data updated successfully";

      return new Response(
        JSON.stringify({
          message: responseMessage,
          documentType,
          kycApplication: {
            status: kycApplication.status,
            completionPercentage: kycApplication.completionPercentage,
            documents: kycApplication.documents,
            paymentStatus: kycApplication.paymentStatus,
          },
        }),
        { status: 200 }
      );
    } catch (error) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.error("Error aborting transaction:", abortError);
        }
      }

      if (
        error.message &&
        error.message.includes("Write conflict") &&
        retryCount < maxRetries
      ) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
        continue;
      }

      console.error("Error processing KYC data:", error);
      // Return a more user-friendly error message
      const errorMessage =
        error.message ||
        "Internal server error occurred while processing your request.";
      return new Response(
        JSON.stringify({
          message: errorMessage,
        }),
        { status: 500 }
      );
    } finally {
      if (session) {
        try {
          await session.endSession();
        } catch (sessionError) {
          console.error("Error ending session:", sessionError);
        }
      }
      break;
    }
  }
}

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = client.db("TaskEarnDB");
    const usersCollection = db.collection("Users");
    const kycApplicationsCollection = db.collection("kyc-applications");

    const user = await usersCollection.findOne({ email: token.email });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Try to get KYC application from separate collection
    let kycApplication = await kycApplicationsCollection.findOne({
      userEmail: token.email,
    });

    // If no application exists, create a default structure
    if (!kycApplication) {
      kycApplication = {
        status: "none",
        submittedAt: null,
        documents: {
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
        paymentStatus: "not_paid",
        completionPercentage: 0,
      };
    }

    const kycData = {
      status: kycApplication.status,
      submittedAt: kycApplication.submittedAt,
      reviewedAt: user.kycReviewedAt || null,
      documents: kycApplication.documents,
      paymentStatus: kycApplication.paymentStatus,
      paymentAmount: 99,
      rejectionReason: user.kycRejectionReason || null,
      completionPercentage: kycApplication.completionPercentage || 0,
      applicationId: kycApplication._id || null,
    };

    return new Response(JSON.stringify(kycData), { status: 200 });
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
