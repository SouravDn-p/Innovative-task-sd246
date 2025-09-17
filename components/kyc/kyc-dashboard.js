// KYCDashboard component

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  UserCheck,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Shield,
  FileText,
  Banknote,
} from "lucide-react";
import FileUploadZone from "./FileUploadZone";
import {
  useGetKYCDataQuery,
  useUpdateKYCDataMutation,
  useUploadFileMutation,
} from "@/redux/api/api";
import { useToast } from "@/components/ui/use-toast";
import Swal from "sweetalert2";
import { useIsMobile } from "@/components/ui/use-mobile"; // Import mobile detection hook

const KYCDashboard = ({ userEmail }) => {
  const isMobile = useIsMobile(); // Use mobile detection
  const { toast } = useToast();
  const { data: kycData, isLoading, error, refetch } = useGetKYCDataQuery();
  const [updateKYCData, { isLoading: isSubmitting }] =
    useUpdateKYCDataMutation();
  const [uploadFile] = useUploadFileMutation();
  const [showSubmissionAlert, setShowSubmissionAlert] = useState(false); // New state for submission alert

  const [localKycData, setLocalKycData] = useState({
    status: "none",
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
    paymentAmount: 99,
    completionPercentage: 0,
    submittedAt: null,
    rejectionReason: null,
  });

  useEffect(() => {
    if (kycData) {
      setLocalKycData({
        status: kycData.status || "none",
        documents: kycData.documents || {
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
        paymentStatus: kycData.paymentStatus || "not_paid",
        paymentAmount: kycData.paymentAmount || 99,
        completionPercentage: kycData.completionPercentage || 0,
        submittedAt: kycData.submittedAt ? new Date(kycData.submittedAt) : null,
        rejectionReason: kycData.rejectionReason || null,
      });
      // Reset submission alert if status is not pending or under_review
      if (kycData.status !== "pending" && kycData.status !== "under_review") {
        setShowSubmissionAlert(false);
      }
    }
  }, [kycData]);

  const handleFileUpload = async (documentType, file) => {
    try {
      // First, upload the file to /api/upload
      const uploadResult = await uploadFile({
        file,
        documentType,
      }).unwrap();

      // Then, update KYC data with the returned URL and metadata (as JSON)
      const updateData = {
        documentType,
        url: uploadResult.url,
        name: uploadResult.name,
        size: uploadResult.size,
        uploadedAt: uploadResult.uploadedAt,
      };

      const result = await updateKYCData(updateData).unwrap();

      // Update local state with the new data
      if (result.kycApplication) {
        setLocalKycData((prev) => ({
          ...prev,
          documents: result.kycApplication.documents,
          completionPercentage: result.kycApplication.completionPercentage,
          paymentStatus: result.kycApplication.paymentStatus,
        }));
      }

      refetch();
      Swal.fire({
        title: "Document uploaded",
        text: `${documentType} has been uploaded successfully.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Upload error:", err);
      let errorMessage = "Please try again.";
      // Check for specific error messages from the API
      if (err?.data?.message && typeof err.data.message === "string") {
        errorMessage = err.data.message;
      } else if (err?.message && typeof err.message === "string") {
        errorMessage = err.message;
      } else if (err?.data?.error && typeof err.data.error === "string") {
        errorMessage = err.data.error;
      }

      // Check if it's an insufficient balance error
      if (errorMessage.includes("Insufficient wallet balance")) {
        Swal.fire({
          title: "Insufficient Balance",
          text: errorMessage,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Go to Wallet",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/dashboard/user/wallet";
          }
        });
      } else {
        Swal.fire({
          title: "Upload failed",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handlePayment = async () => {
    try {
      const updateData = { paymentStatus: "paid" }; // Send as JSON
      const result = await updateKYCData(updateData).unwrap();

      // Update local state with the new data
      if (result.kycApplication) {
        setLocalKycData((prev) => ({
          ...prev,
          paymentStatus: result.kycApplication.paymentStatus,
        }));
      }

      refetch();
      Swal.fire({
        title: "Payment successful",
        text: "KYC verification fee has been paid. You can now submit your application.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Payment error:", error);
      let errorMessage = "Please try again or contact support.";
      // Check for specific error messages from the API
      if (error?.data?.message && typeof error.data.message === "string") {
        errorMessage = error.data.message;
      } else if (error?.message && typeof error.message === "string") {
        errorMessage = error.message;
      } else if (error?.data?.error && typeof error.data.error === "string") {
        errorMessage = error.data.error;
      } else if (error?.status) {
        errorMessage = `HTTP ${error.status}: ${
          error.statusText || "Request failed"
        }`;
      }

      // Check if it's an insufficient balance error
      if (errorMessage.includes("Insufficient wallet balance")) {
        Swal.fire({
          title: "Insufficient Balance",
          text: errorMessage,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Go to Wallet",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/dashboard/user/wallet";
          }
        });
      } else {
        Swal.fire({
          title: "Payment failed",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleSubmitKYC = async () => {
    const allDocs = ["aadhar", "pan", "selfie", "bankStatement"];
    const missingDocs = allDocs.filter(
      (doc) =>
        !localKycData.documents[doc]?.uploaded &&
        !localKycData.documents[doc]?.url
    );

    if (missingDocs.length > 0) {
      Swal.fire({
        title: "Missing documents",
        text: `Please upload: ${missingDocs.join(", ")}`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (localKycData.paymentStatus !== "paid") {
      Swal.fire({
        title: "Payment required",
        text: "Please complete the KYC verification fee payment first.",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Go to Wallet",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/dashboard/user/wallet";
        }
      });
      return;
    }

    try {
      const updateData = { submitForReview: "true" }; // Send as JSON
      const result = await updateKYCData(updateData).unwrap();

      // Update local state with the new data
      if (result.kycApplication) {
        setLocalKycData((prev) => ({
          ...prev,
          status: result.kycApplication.status,
        }));
        setShowSubmissionAlert(true); // Show the submission alert
      }

      refetch();
      Swal.fire({
        title: "KYC Submitted Successfully",
        text: "Your KYC application has been submitted and is now under review. Please wait for admin approval, which typically takes 24-48 hours.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Submission error:", error);
      let errorMessage = "Please try again or contact support.";
      // Check for specific error messages from the API
      if (error?.data?.message && typeof error.data.message === "string") {
        errorMessage = error.data.message;
      } else if (error?.message && typeof error.message === "string") {
        errorMessage = error.message;
      } else if (error?.data?.error && typeof error.data.error === "string") {
        errorMessage = error.data.error;
      }

      // Check if it's an insufficient balance error
      if (errorMessage.includes("Insufficient wallet balance")) {
        Swal.fire({
          title: "Insufficient Balance",
          text: errorMessage,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Go to Wallet",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/dashboard/user/wallet";
          }
        });
      } else {
        Swal.fire({
          title: "Submission Failed",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-success-light text-success border-success/20";
      case "pending":
      case "under_review":
        return "bg-warning-light text-warning-foreground border-warning/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-info-light text-info border-info/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "pending":
      case "under_review":
        return <Clock className="h-5 w-5 text-warning" />;
      case "rejected":
        return <X className="h-5 w-5 text-destructive" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-info" />;
    }
  };

  const canStartKYC = localKycData.status === "none";
  const canResubmit = localKycData.status === "rejected";
  const isUnderReview =
    localKycData.status === "pending" || localKycData.status === "under_review";
  const isVerified = localKycData.status === "verified";

  // Check if all documents (including bankStatement) are uploaded for 100% progress
  const allDocsUploaded = ["aadhar", "pan", "selfie", "bankStatement"].every(
    (doc) =>
      localKycData.documents[doc]?.uploaded || localKycData.documents[doc]?.url
  );

  const canUploadDocuments =
    (canStartKYC || canResubmit) && localKycData.status !== "pending";

  // Show payment only when all documents are uploaded and not paid
  const canPay = allDocsUploaded && localKycData.paymentStatus !== "paid";

  // Show submit only after payment and when all documents are uploaded
  const canSubmitApplication =
    localKycData.paymentStatus === "paid" &&
    allDocsUploaded &&
    (canStartKYC || canResubmit);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("KYC data loading error:", error);
    let errorMessage = "Error loading KYC data. Please try again.";
    // Check for specific error messages from the API
    if (error?.data?.message && typeof error.data.message === "string") {
      errorMessage = error.data.message;
    } else if (error?.message && typeof error.message === "string") {
      errorMessage = error.message;
    } else if (error?.status) {
      errorMessage = `HTTP ${error.status}: ${
        error.statusText || "Request failed"
      }`;
    }

    // Show error with SweetAlert
    if (errorMessage.includes("Insufficient wallet balance")) {
      Swal.fire({
        title: "Insufficient Balance",
        text: errorMessage,
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Go to Wallet",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/dashboard/user/wallet";
        }
      });
    } else {
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }

    // Also render the error in the UI as fallback
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Complete your identity verification to unlock all features
          </p>
        </div>

        {/* Status Overview */}
        <Card className={`border-2 ${getStatusColor(localKycData.status)}`}>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-background rounded-full shadow-sm">
                  <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    Verification Status
                  </h2>
                  <p className="text-xs md:text-sm opacity-90">
                    {isVerified
                      ? "Your identity has been verified successfully"
                      : isUnderReview
                      ? "Your documents are being reviewed"
                      : "Complete verification to unlock withdrawals"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant="outline"
                  className={(() => {
                    switch (localKycData.status) {
                      case "verified":
                        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800";
                      case "pending":
                      case "under_review":
                        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800";
                      case "none":
                        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
                      case "rejected":
                        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
                      default:
                        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
                    }
                  })()}
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    {getStatusIcon(localKycData.status)}
                    <span className="text-xs md:text-sm">
                      {localKycData.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </Badge>
                {localKycData.submittedAt && (
                  <p className="text-xs opacity-75 mt-1">
                    Submitted: {localKycData.submittedAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 md:mt-6">
              <div className="flex justify-between text-xs md:text-sm mb-1 md:mb-2">
                <span>Completion Progress</span>
                <span>{localKycData.completionPercentage}%</span>
              </div>
              <Progress
                value={localKycData.completionPercentage}
                className="h-2 md:h-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submission Success Alert */}
        {showSubmissionAlert && isUnderReview && (
          <Alert className="border-warning/20 bg-warning-light">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm">
              <strong>KYC Application Submitted!</strong> Your documents are now
              under review. Please wait for admin approval, which typically
              takes 24-48 hours. You will be notified once the review is
              complete.
            </AlertDescription>
          </Alert>
        )}

        {/* Alerts */}
        {localKycData.status === "none" && !showSubmissionAlert && (
          <Alert className="border-info/20 bg-info-light">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm">
              Complete KYC verification to unlock withdrawal features and
              increase your task limits.
              <strong> Verification fee: ₹{localKycData.paymentAmount}</strong>
            </AlertDescription>
          </Alert>
        )}

        {localKycData.status === "rejected" && localKycData.rejectionReason && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm">
              <strong>KYC Rejected:</strong> {localKycData.rejectionReason}
              <br />
              Please resubmit your documents with the required corrections.
            </AlertDescription>
          </Alert>
        )}

        {localKycData.status === "verified" && (
          <Alert className="border-success/20 bg-success-light">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm">
              <strong>Congratulations!</strong> Your KYC verification is
              complete. You can now withdraw funds and access premium features.
            </AlertDescription>
          </Alert>
        )}

        {isUnderReview && !showSubmissionAlert && (
          <Alert className="border-warning/20 bg-warning-light">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm">
              Your KYC documents are under review. We&apos;ll notify you once
              verification is complete (usually within 24-48 hours).
            </AlertDescription>
          </Alert>
        )}

        {/* Document Upload Section */}
        {(canStartKYC || canResubmit) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-lg">Document Upload</span>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Upload all required documents for identity verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadZone
                documentType="aadhar"
                onFileUpload={(file) => handleFileUpload("aadhar", file)}
                existingFile={localKycData.documents.aadhar}
                required
                disabled={!canUploadDocuments}
              />
              <FileUploadZone
                documentType="pan"
                onFileUpload={(file) => handleFileUpload("pan", file)}
                existingFile={localKycData.documents.pan}
                required
                disabled={!canUploadDocuments}
              />
              <FileUploadZone
                documentType="selfie"
                onFileUpload={(file) => handleFileUpload("selfie", file)}
                existingFile={localKycData.documents.selfie}
                required
                disabled={!canUploadDocuments}
              />
              <FileUploadZone
                documentType="bankStatement"
                onFileUpload={(file) => handleFileUpload("bankStatement", file)}
                existingFile={localKycData.documents.bankStatement}
                required
                disabled={!canUploadDocuments}
              />

              {/* Show message if all documents are uploaded */}
              {allDocsUploaded && localKycData.paymentStatus !== "paid" && (
                <Alert className="border-success/20 bg-success-light">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs md:text-sm">
                    <strong>All documents uploaded!</strong> Now you can proceed
                    with payment.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Section - shown when all documents are uploaded */}
        {canPay && (
          <Card className="border-warning/20 bg-warning-light">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 bg-background rounded-full">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-warning-foreground text-sm md:text-base">
                      KYC Verification Fee
                    </h3>
                    <p className="text-xs text-warning-foreground/80">
                      One-time payment of ₹{localKycData.paymentAmount} to
                      complete verification
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
                  size="sm"
                >
                  {isSubmitting
                    ? "Processing..."
                    : `Pay ₹${localKycData.paymentAmount}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              <span className="text-lg">Verification Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success flex-shrink-0" />
                <span className="text-xs md:text-sm">
                  Unlock withdrawal features
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success flex-shrink-0" />
                <span className="text-xs md:text-sm">
                  Higher task earning limits
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success flex-shrink-0" />
                <span className="text-xs md:text-sm">
                  Priority customer support
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success flex-shrink-0" />
                <span className="text-xs md:text-sm">
                  Enhanced account security
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success flex-shrink-0" />
                <span className="text-xs md:text-sm">
                  Access to premium tasks
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success flex-shrink-0" />
                <span className="text-xs md:text-sm">
                  Faster payment processing
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Application Section - shown at the bottom after payment and when all documents are uploaded */}
        {canSubmitApplication && (
          <Card className="border-success/20 bg-success-light">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 bg-background rounded-full">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-success-foreground text-sm md:text-base">
                      Ready to Submit
                    </h3>
                    <p className="text-xs text-success-foreground/80">
                      All documents uploaded and payment completed. Submit for
                      review.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSubmitKYC}
                  disabled={isSubmitting}
                  className="bg-success hover:bg-success/90 text-success-foreground w-full sm:w-auto"
                  size="sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Fixed Submit Button - shown at the bottom for mobile users when application can be submitted */}
        {isMobile && canSubmitApplication && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
            <Button
              onClick={handleSubmitKYC}
              disabled={isSubmitting}
              className="bg-success hover:bg-success/90 text-success-foreground w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCDashboard;
