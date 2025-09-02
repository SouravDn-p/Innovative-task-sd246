"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  FileImage,
  Link as LinkIcon,
  Award,
  Timer,
  Shield,
  Wallet,
  TrendingUp,
  Eye,
} from "lucide-react";
import Image from "next/image";
import {
  useGetAdminTaskSubmissionDetailsQuery,
  useReviewTaskSubmissionMutation,
} from "@/redux/api/api";

export default function TaskSubmissionDetailsPage({ params }) {
  const router = useRouter();
  const { id } = params;

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");

  // API queries
  const {
    data: submissionData,
    isLoading,
    error,
    refetch,
  } = useGetAdminTaskSubmissionDetailsQuery(id);

  const [reviewSubmission, { isLoading: reviewingSubmission }] =
    useReviewTaskSubmissionMutation();

  const submission = submissionData?.submission;

  const handleReview = async () => {
    try {
      await reviewSubmission({
        submissionId: id,
        action: reviewAction,
        feedback: reviewFeedback,
      }).unwrap();

      toast.success(`Task ${reviewAction}d successfully`, {
        description:
          reviewAction === "approve"
            ? `₹${submission.task?.reward || 0} has been credited to ${
                submission.user?.name || submission.userName
              }'s wallet`
            : `Task submission has been rejected`,
      });

      setShowReviewModal(false);
      setReviewAction("");
      setReviewFeedback("");
      refetch();
    } catch (error) {
      console.error("Failed to review submission:", error);
      toast.error("Error", {
        description: `Failed to ${reviewAction} submission: ${
          error?.data?.error || "Unknown error"
        }`,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-teal-200 rounded w-1/3"></div>
          <div className="h-64 bg-teal-200 rounded"></div>
          <div className="h-32 bg-teal-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  Error Loading Submission
                </h3>
                <p className="text-red-600">
                  {error?.data?.error || "Submission not found"}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-red-200 text-red-700"
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => refetch()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-teal-700 hover:bg-teal-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-900">
            Task Submission Review
          </h1>
          <p className="text-teal-600 mt-1">
            Submitted by {submission.user?.name || submission.userName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(submission.status)} size="lg">
            {submission.status}
          </Badge>
          {submission.status === "pending" && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setReviewAction("approve");
                  setShowReviewModal(true);
                }}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => {
                  setReviewAction("reject");
                  setShowReviewModal(true);
                }}
                variant="destructive"
                size="sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Information */}
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-900 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-teal-900">
                  {submission.task?.title || "Unknown Task"}
                </h3>
                <p className="text-teal-600 mt-1">
                  {submission.task?.description || "No description available"}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm text-teal-600">Reward</p>
                    <p className="font-semibold text-teal-900">
                      ₹{submission.task?.reward || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm text-teal-600">Category</p>
                    <p className="font-semibold text-teal-900">
                      {submission.task?.category || "General"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm text-teal-600">Task End</p>
                    <p className="font-semibold text-teal-900">
                      {submission.task?.endAt
                        ? new Date(submission.task.endAt).toLocaleDateString()
                        : "No deadline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm text-teal-600">Time Taken</p>
                    <p className="font-semibold text-teal-900">
                      {submission.timeToSubmit
                        ? `${submission.timeToSubmit}h`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {submission.task?.requirements && (
                <div>
                  <h4 className="font-medium text-teal-900 mb-2">
                    Task Requirements
                  </h4>
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <p className="text-sm text-teal-700">
                      {submission.task.requirements.details ||
                        "No specific requirements listed"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-900 flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Submitted Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              {submission.proofData?.description && (
                <div>
                  <h4 className="font-medium text-teal-900 mb-2">
                    Description
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {submission.proofData.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Images */}
              {submission.proofData?.images &&
                submission.proofData.images.length > 0 && (
                  <div>
                    <h4 className="font-medium text-teal-900 mb-2">
                      Images ({submission.proofData.images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {submission.proofData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={
                                typeof image === "string"
                                  ? image
                                  : URL.createObjectURL(image)
                              }
                              alt={`Proof image ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-100"
                              onClick={() =>
                                window.open(
                                  typeof image === "string"
                                    ? image
                                    : URL.createObjectURL(image),
                                  "_blank"
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Links */}
              {submission.proofData?.links && (
                <div>
                  <h4 className="font-medium text-teal-900 mb-2">Links</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {submission.proofData.links
                        .split("\n")
                        .filter((link) => link.trim())
                        .map((link, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-teal-600" />
                            <a
                              href={link.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {link.trim()}
                            </a>
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {submission.note && (
                <div>
                  <h4 className="font-medium text-teal-900 mb-2">
                    Additional Notes
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-700 whitespace-pre-wrap">
                      {submission.note}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Information */}
          {submission.status !== "pending" && submission.reviewedAt && (
            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-900 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Review Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-teal-600">Reviewed By</p>
                    <p className="font-semibold text-teal-900">
                      {submission.reviewedBy || "System"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-teal-600">Review Date</p>
                    <p className="font-semibold text-teal-900">
                      {formatDate(submission.reviewedAt)}
                    </p>
                  </div>
                </div>

                {submission.reviewFeedback && (
                  <div>
                    <p className="text-sm text-teal-600 mb-2">Feedback</p>
                    <div
                      className={`p-4 rounded-lg ${
                        submission.status === "approved"
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      <p
                        className={`${
                          submission.status === "approved"
                            ? "text-green-700"
                            : "text-red-700"
                        } whitespace-pre-wrap`}
                      >
                        {submission.reviewFeedback}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={submission.user?.image}
                    alt={submission.user?.name}
                  />
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    {submission.user?.name?.charAt(0) ||
                      submission.userName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-teal-900">
                    {submission.user?.name || submission.userName}
                  </p>
                  <p className="text-sm text-teal-600">
                    {submission.userEmail}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-600">KYC Status</span>
                  <Badge
                    variant={
                      submission.user?.kycStatus === "verified"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {submission.user?.kycStatus || "none"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-600">Wallet Balance</span>
                  <span className="font-semibold text-teal-900">
                    ₹{submission.user?.walletBalance?.toFixed(2) || "0.00"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-600">Total Earned</span>
                  <span className="font-semibold text-teal-900">
                    ₹{submission.user?.totalEarned?.toFixed(2) || "0.00"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-600">Tasks Completed</span>
                  <span className="font-semibold text-teal-900">
                    {submission.user?.tasksCompleted || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-600">Join Date</span>
                  <span className="font-semibold text-teal-900">
                    {submission.user?.joinDate
                      ? new Date(submission.user.joinDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Statistics */}
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <p className="text-2xl font-bold text-teal-900">
                    {submission.userHistory?.totalSubmissions || 0}
                  </p>
                  <p className="text-xs text-teal-600">Total Submissions</p>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">
                    {submission.userHistory?.approvedSubmissions || 0}
                  </p>
                  <p className="text-xs text-green-600">Approved</p>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-900">
                    {submission.userHistory?.rejectedSubmissions || 0}
                  </p>
                  <p className="text-xs text-red-600">Rejected</p>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">
                    {submission.userHistory?.totalSubmissions > 0
                      ? Math.round(
                          (submission.userHistory.approvedSubmissions /
                            submission.userHistory.totalSubmissions) *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-blue-600">Success Rate</p>
                </div>
              </div>

              {submission.userHistory?.recentSubmissions?.length > 0 && (
                <div>
                  <h4 className="font-medium text-teal-900 mb-2">
                    Recent Submissions
                  </h4>
                  <div className="space-y-2">
                    {submission.userHistory.recentSubmissions
                      .slice(0, 3)
                      .map((recent, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                        >
                          <span className="text-gray-700 truncate flex-1">
                            {recent.taskTitle}
                          </span>
                          <Badge
                            className={getStatusColor(recent.status)}
                            size="sm"
                          >
                            {recent.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Timeline */}
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Task Joined
                    </p>
                    <p className="text-xs text-gray-600">
                      {submission.userTask?.dateJoined
                        ? formatDate(submission.userTask.dateJoined)
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Proof Submitted
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(submission.submittedAt)}
                    </p>
                  </div>
                </div>

                {submission.reviewedAt && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        submission.status === "approved"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {submission.status === "approved"
                          ? "Approved"
                          : "Rejected"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(submission.reviewedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-teal-900">
              {reviewAction === "approve"
                ? "Approve Submission"
                : "Reject Submission"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "This will approve the submission and add the reward to the user's wallet."
                : "This will reject the submission. Please provide feedback for the user."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">
                {reviewAction === "approve"
                  ? "Approval Message (Optional)"
                  : "Rejection Reason"}
              </Label>
              <Textarea
                id="feedback"
                placeholder={
                  reviewAction === "approve"
                    ? "Great work! Task completed successfully."
                    : "Please explain why this submission is being rejected..."
                }
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={4}
                className="border-teal-200 focus:border-teal-500"
                required={reviewAction === "reject"}
              />
            </div>

            {reviewAction === "approve" && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Wallet className="h-4 w-4" />
                  <span className="font-medium">
                    Reward: ₹{submission.task?.reward || 0}
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  This amount will be added to{" "}
                  {submission.user?.name || submission.userName}&apos;s wallet.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewModal(false);
                setReviewAction("");
                setReviewFeedback("");
              }}
              className="border-teal-200 text-teal-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={
                reviewingSubmission ||
                (reviewAction === "reject" && !reviewFeedback.trim())
              }
              className={
                reviewAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {reviewingSubmission
                ? "Processing..."
                : reviewAction === "approve"
                ? "Approve & Pay"
                : "Reject Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
