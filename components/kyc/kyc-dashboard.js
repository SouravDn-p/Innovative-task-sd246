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
import { useGetKYCDataQuery, useUpdateKYCDataMutation } from "@/redux/api/api";
import { useToast } from "@/hooks/use-toast";

const KYCDashboard = ({ userEmail }) => {
  const { toast } = useToast();
  const { data: kycData, isLoading, error, refetch } = useGetKYCDataQuery();
  const [updateKYCData, { isLoading: isSubmitting }] =
    useUpdateKYCDataMutation();

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
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("file", file);

      await updateKYCData(formData).unwrap();
      refetch();
      toast({
        title: "Document uploaded",
        description: `${documentType} has been uploaded successfully.`,
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateCompletionPercentage = (documents) => {
    const requiredDocs = ["aadhar", "pan", "selfie"];
    const uploadedRequired = requiredDocs.filter(
      (doc) => documents[doc]?.url
    ).length;
    const optionalUploaded = documents.bankStatement?.url ? 1 : 0;
    return Math.round(
      ((uploadedRequired + optionalUploaded) / (requiredDocs.length + 1)) * 100
    );
  };

  const handlePayment = async () => {
    try {
      const formData = new FormData();
      formData.append("paymentStatus", "paid");

      await updateKYCData(formData).unwrap();
      refetch();
      toast({
        title: "Payment successful",
        description:
          "KYC verification fee has been paid. You can now upload your documents.",
      });
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitKYC = async () => {
    const requiredDocs = ["aadhar", "pan", "selfie"];
    const missingDocs = requiredDocs.filter(
      (doc) => !localKycData.documents[doc]?.url
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
      await updateKYCData({ documents: localKycData.documents }).unwrap();
      refetch();
      toast({
        title: "KYC submitted successfully",
        description:
          "Your documents are now under review. We'll notify you within 24-48 hours.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact support.",
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
  const canUploadDocuments =
    localKycData.paymentStatus === "paid" && (canStartKYC || canResubmit);
  const allRequiredDocsUploaded = ["aadhar", "pan", "selfie"].every(
    (doc) => localKycData.documents[doc]?.url
  );

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
            <div className="flex items-center justify-between">
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
                <Badge variant="outline" className="bg-background/50">
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

        {/* Payment Section */}
        {localKycData.paymentStatus !== "paid" && (
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
                      One-time payment of ₹{localKycData.paymentAmount} to start
                      verification
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

        {/* Document Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>
              Upload the required documents for identity verification
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
              disabled={!canUploadDocuments}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {(canStartKYC || canResubmit) && (
          <div className="flex gap-4 justify-center">
            {allRequiredDocsUploaded &&
            localKycData.paymentStatus === "paid" ? (
              <Button
                onClick={handleSubmitKYC}
                disabled={isSubmitting}
                size="lg"
                className="px-8"
              >
                {isSubmitting
                  ? canResubmit
                    ? "Resubmitting..."
                    : "Submitting..."
                  : canResubmit
                  ? "Resubmit Documents"
                  : "Apply"}
              </Button>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please upload the following required documents:{" "}
                  {["aadhar", "pan", "selfie"]
                    .filter((doc) => !localKycData.documents[doc]?.url)
                    .join(", ")}
                </AlertDescription>
              </Alert>
            )}
          </div>
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
      </div>
    </div>
  );
};

export default KYCDashboard;
