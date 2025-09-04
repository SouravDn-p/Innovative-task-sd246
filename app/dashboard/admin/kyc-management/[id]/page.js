"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  X,
  Eye,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  CreditCard,
  Download,
  Image as ImageIcon,
  File as FileIcon,
  UserCheck,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  useGetAdminKYCApplicationDetailsQuery,
  useApproveKYCApplicationMutation,
} from "@/redux/api/api";
import { AdminKYCDetails } from "@/components/kyc/admin-kyc-details";
import Image from "next/image";

export default function AdminKYCDetailsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data, isLoading, error, refetch } =
    useGetAdminKYCApplicationDetailsQuery(id);
  const [approveKYC, { isLoading: approving }] =
    useApproveKYCApplicationMutation();

  const application = data?.application;

  const handleApprove = async () => {
    try {
      await approveKYC({
        applicationId: id,
        action: "approve",
        notes: reviewNotes,
      }).unwrap();

      toast({
        title: "KYC Approved",
        description: "KYC application has been approved successfully.",
      });

      setReviewNotes("");
      refetch();
    } catch (error) {
      console.error("Failed to approve KYC:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to approve KYC application. Please try again.";

      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this application.",
        variant: "destructive",
      });
      return;
    }

    try {
      await approveKYC({
        applicationId: id,
        action: "reject",
        rejectionReason,
        notes: reviewNotes,
      }).unwrap();

      toast({
        title: "KYC Rejected",
        description: "KYC application has been rejected successfully.",
      });

      setRejectionReason("");
      setReviewNotes("");
      setShowRejectDialog(false);
      refetch();
    } catch (error) {
      console.error("Failed to reject KYC:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to reject KYC application. Please try again.";

      toast({
        title: "Rejection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePreviewDocument = (docType, doc) => {
    if (doc.url) {
      setPreviewDocument({ type: docType, ...doc });
      setPreviewOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getDocumentIcon = (docType) => {
    if (docType === "bankStatement") {
      return <FileIcon className="h-5 w-5" />;
    }
    return <ImageIcon className="h-5 w-5" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">
            Error Loading KYC Application
          </h2>
          <p className="text-red-600 mb-4">
            {error?.data?.message || "Failed to load KYC application details"}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-900 mb-2">
            KYC Application Not Found
          </h2>
          <p className="text-yellow-600 mb-4">
            The requested KYC application could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 hidden sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <h1 className="text-2xl font-bold">KYC Application Details</h1>
          <div></div> {/* Spacer for flex alignment */}
        </div>

        {/* Application Details */}
        <div className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{application.userName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{application.email}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{application.phone}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <Badge className={getStatusColor(application.kycStatus)}>
                    {application.kycStatus.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Submitted At
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {formatDate(application.submittedAt)}
                    </p>
                  </div>
                </div>
                {application.reviewedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Reviewed At
                    </Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {formatDate(application.reviewedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(application.documents || {}).map(
                  ([docType, doc]) => (
                    <div
                      key={docType}
                      className="border rounded-lg p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDocumentIcon(docType)}
                          <h4 className="font-medium capitalize">
                            {docType.replace(/([A-Z])/g, " $1")}
                          </h4>
                        </div>
                        {doc.uploaded || doc.url ? (
                          <Badge className="bg-green-100 text-green-800">
                            Uploaded
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Uploaded</Badge>
                        )}
                      </div>

                      {doc.uploaded || doc.url ? (
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewDocument(docType, doc)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.url, "_blank")}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No document uploaded
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    application.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {application.paymentStatus.replace("_", " ")}
                </Badge>
                <span className="text-sm">KYC Fee: ₹99</span>
              </div>
            </CardContent>
          </Card>

          {/* Review Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any notes about this KYC application..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {application.kycStatus === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={approving}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {approving ? "Approving..." : "Approve"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {previewDocument?.type?.replace(/([A-Z])/g, " $1")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-[70vh] bg-gray-50 rounded-lg">
            {previewDocument?.url ? (
              previewDocument.url.endsWith(".pdf") ? (
                <iframe
                  src={previewDocument.url}
                  className="w-full h-full rounded-lg"
                  title="Document Preview"
                />
              ) : (
                <Image
                  width={300}
                  height={300}
                  src={previewDocument.url}
                  alt="Document Preview"
                  className="max-h-full max-w-full object-contain"
                />
              )
            ) : (
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>No preview available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="rejectNotes">Review Notes (Optional)</Label>
              <Textarea
                id="rejectNotes"
                placeholder="Add any additional notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={approving}
            >
              {approving ? "Rejecting..." : "Reject Application"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
