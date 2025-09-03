// Modified KYCDashboard component
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
import { Alert, AlertDescription, AlertCircle } from "../ui/alert";
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
  useUploadDocumentMutation,
} from "@/redux/api/api"; // Added useUploadDocumentMutation
import { useToast } from "@/components/ui/use-toast"; // Fixed import path

const KYCDashboard = ({ userEmail }) => {
  const { toast } = useToast();
  const { data: kycData, isLoading, error, refetch } = useGetKYCDataQuery();
  const [updateKYCData, { isLoading: isSubmitting }] =
    useUpdateKYCDataMutation();
  const [uploadDocument] = useUploadDocumentMutation(); // New mutation for separate upload

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
    }
  }, [kycData]);

  const handleFileUpload = async (documentType, file) => {
    try {
      // First, upload the file to /api/upload
      const uploadResult = await uploadDocument({
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
      toast({
        title: "Document uploaded",
        description: `${documentType} has been uploaded successfully.`,
      });
    } catch (err) {
      console.error("Upload error:", err);
      // Fix the error handling to ensure we're passing strings to toast
      let errorMessage = "Please try again.";
      if (err?.data?.message && typeof err.data.message === "string") {
        errorMessage = err.data.message;
      } else if (err?.message && typeof err.message === "string") {
        errorMessage = err.message;
      }
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
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
      toast({
        title: "Payment successful",
        description:
          "KYC verification fee has been paid. You can now submit your application.",
      });
    } catch (error) {
      let errorMessage = "Please try again or contact support.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        errorMessage = `HTTP ${error.status}: ${
          error.statusText || "Request failed"
        }`;
      }
      toast({
        title: "Payment failed",
        description: errorMessage,
        variant: "destructive",
      });
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
      toast({
        title: "Missing documents",
        description: `Please upload: ${missingDocs.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (localKycData.paymentStatus !== "paid") {
      toast({
        title: "Payment required",
        description: "Please complete the KYC verification fee payment first.",
        variant: "destructive",
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
      }

      refetch();
      toast({
        title: "KYC submitted successfully",
        description:
          "Your documents are now under review. We'll notify you within 24-48 hours.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description:
          error?.data?.message || "Please try again or contact support.",
        variant: "destructive",
      });
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading KYC data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground">
            Complete your identity verification to unlock all features
          </p>
        </div>

        {/* Status Overview */}
        <Card className={`border-2 ${getStatusColor(localKycData.status)}`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-background rounded-full shadow-sm">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Verification Status</h2>
                  <p className="text-sm opacity-90">
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
                  <div className="flex items-center gap-2">
                    {getStatusIcon(localKycData.status)}
                    {localKycData.status.replace("_", " ").toUpperCase()}
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
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Completion Progress</span>
                <span>{localKycData.completionPercentage}%</span>
              </div>
              <Progress
                value={localKycData.completionPercentage}
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {localKycData.status === "none" && (
          <Alert className="border-info/20 bg-info-light">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Complete KYC verification to unlock withdrawal features and
              increase your task limits.
              <strong> Verification fee: ₹{localKycData.paymentAmount}</strong>
            </AlertDescription>
          </Alert>
        )}

        {localKycData.status === "rejected" && localKycData.rejectionReason && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>
              <strong>KYC Rejected:</strong> {localKycData.rejectionReason}
              <br />
              Please resubmit your documents with the required corrections.
            </AlertDescription>
          </Alert>
        )}

        {localKycData.status === "verified" && (
          <Alert className="border-success/20 bg-success-light">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Congratulations!</strong> Your KYC verification is
              complete. You can now withdraw funds and access premium features.
            </AlertDescription>
          </Alert>
        )}

        {isUnderReview && (
          <Alert className="border-warning/20 bg-warning-light">
            <Clock className="h-4 w-4" />
            <AlertDescription>
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
                Document Upload
              </CardTitle>
              <CardDescription>
                Upload all required documents for identity verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
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
                required // Made required for 100% progress
                disabled={!canUploadDocuments}
              />

              {/* Show message if all documents are uploaded */}
              {allDocsUploaded && localKycData.paymentStatus !== "paid" && (
                <Alert className="border-success/20 bg-success-light">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-background rounded-full">
                    <CreditCard className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-warning-foreground">
                      KYC Verification Fee
                    </h3>
                    <p className="text-sm text-warning-foreground/80">
                      One-time payment of ₹{localKycData.paymentAmount} to
                      complete verification
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="bg-warning hover:bg-warning/90 text-warning-foreground"
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
              Verification Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm">Unlock withdrawal features</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm">Higher task earning limits</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm">Priority customer support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm">Enhanced account security</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm">Access to premium tasks</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm">Faster payment processing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Application Section - shown at the bottom after payment and when all documents are uploaded */}
        {canSubmitApplication && (
          <Card className="border-success/20 bg-success-light">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-background rounded-full">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-success-foreground">
                      Ready to Submit
                    </h3>
                    <p className="text-sm text-success-foreground/80">
                      All documents uploaded and payment completed. Submit for
                      review.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSubmitKYC}
                  disabled={isSubmitting}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KYCDashboard;
