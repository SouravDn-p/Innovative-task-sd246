"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Link as LinkIcon,
  Calendar,
  DollarSign,
  User,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobiles";
import {
  useGetAdminTaskSubmissionsQuery,
  useReviewTaskSubmissionMutation,
} from "@/redux/api/api";

export default function AdminTaskSubmissionsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedSubmissions, setSelectedSubmissions] = useState(new Set());
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    submissionId: null,
    action: null,
    taskTitle: "",
    userName: "",
    reward: 0,
  });
  const [feedback, setFeedback] = useState("");

  // API queries
  const {
    data: submissionsData,
    isLoading,
    error,
    refetch,
  } = useGetAdminTaskSubmissionsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : "",
  });

  const [reviewSubmission, { isLoading: reviewingSubmission }] =
    useReviewTaskSubmissionMutation();

  const submissions = submissionsData?.submissions || [];
  const pagination = submissionsData?.pagination || {};
  const statistics = submissionsData?.statistics || {};

  // Utility functions
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openConfirmDialog = (
    submissionId,
    action,
    taskTitle,
    userName,
    reward
  ) => {
    setConfirmDialog({
      open: true,
      submissionId,
      action,
      taskTitle,
      userName,
      reward,
    });
    setFeedback("");
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      submissionId: null,
      action: null,
      taskTitle: "",
      userName: "",
      reward: 0,
    });
    setFeedback("");
  };

  const handleReviewSubmission = async () => {
    try {
      await reviewSubmission({
        submissionId: confirmDialog.submissionId,
        action: confirmDialog.action,
        feedback,
      }).unwrap();

      toast.success(
        `Task ${
          confirmDialog.action === "approve" ? "approved" : "rejected"
        } successfully`,
        {
          description:
            confirmDialog.action === "approve"
              ? `₹${confirmDialog.reward} has been credited to ${confirmDialog.userName}'s wallet`
              : `Task submission has been rejected`,
        }
      );

      refetch();
      closeConfirmDialog();
    } catch (error) {
      console.error(`Failed to ${confirmDialog.action} submission:`, error);
      toast.error("Error", {
        description: `Failed to ${confirmDialog.action} submission: ${
          error?.data?.error || "Unknown error"
        }`,
      });
    }
  };

  const handleQuickAction = async (submissionId, action) => {
    try {
      await reviewSubmission({
        submissionId,
        action,
        feedback: action === "approve" ? "Approved" : "Rejected",
      }).unwrap();

      toast.success(`Task ${action}d successfully`, {
        description:
          action === "approve"
            ? "Reward has been credited to user's wallet"
            : "Task submission has been rejected",
      });

      refetch();
    } catch (error) {
      console.error(`Failed to ${action} submission:`, error);
      toast.error("Error", {
        description: `Failed to ${action} submission: ${
          error?.data?.error || "Unknown error"
        }`,
      });
    }
  };

  const handleViewDetails = (submissionId) => {
    router.push(`/dashboard/admin/tasks-submissions/${submissionId}`);
  };

  const handleSelectSubmission = (submissionId) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(submissionId)) {
      newSelected.delete(submissionId);
    } else {
      newSelected.add(submissionId);
    }
    setSelectedSubmissions(newSelected);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-teal-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  Error Loading Submissions
                </h3>
                <p className="text-red-600">
                  {error?.data?.error || "Failed to load submission data"}
                </p>
              </div>
              <Button
                onClick={() => refetch()}
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && closeConfirmDialog()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "approve"
                ? "Approve Task Submission"
                : "Reject Task Submission"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "approve"
                ? `Are you sure you want to approve this task submission? This will credit ₹${confirmDialog.reward} to ${confirmDialog.userName}'s wallet.`
                : `Are you sure you want to reject this task submission? No reward will be given.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Task:</span>
              <span className="col-span-3 text-sm">
                {confirmDialog.taskTitle}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">User:</span>
              <span className="col-span-3 text-sm">
                {confirmDialog.userName}
              </span>
            </div>
            {confirmDialog.action === "approve" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Reward:</span>
                <span className="col-span-3 text-sm font-medium text-green-600">
                  ₹{confirmDialog.reward}
                </span>
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                Feedback {confirmDialog.action === "reject" && "(Required)"}
              </label>
              <Textarea
                id="feedback"
                placeholder={
                  confirmDialog.action === "reject"
                    ? "Reason for rejection..."
                    : "Optional feedback..."
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required={confirmDialog.action === "reject"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmission}
              disabled={
                reviewingSubmission ||
                (confirmDialog.action === "reject" && !feedback.trim())
              }
              className={
                confirmDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {reviewingSubmission
                ? "Processing..."
                : confirmDialog.action === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-900 truncate">
              Task Submissions
            </h1>
            <p className="text-sm sm:text-base text-teal-600 mt-1">
              {isMobile
                ? "Review submissions"
                : "Review and approve task submissions"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-yellow-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-yellow-600 truncate">
                    Pending Review
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-900 truncate">
                    {statistics.pendingSubmissions || 0}
                  </p>
                </div>
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-yellow-500 shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-green-600 truncate">
                    Approved
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 truncate">
                    {statistics.approvedSubmissions || 0}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-500 shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-red-600 truncate">
                    Rejected
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-900 truncate">
                    {statistics.rejectedSubmissions || 0}
                  </p>
                </div>
                <XCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-500 shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-teal-600 truncate">
                    Total Rewards
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-teal-900 truncate">
                    ₹{(statistics.totalRewards || 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-teal-500 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-teal-200">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400 h-4 w-4" />
              <Input
                placeholder={
                  isMobile ? "Search..." : "Search by user, task, or content..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-teal-200 focus:border-teal-500 text-sm sm:text-base"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-teal-200 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table/Cards */}
      <Card className="border-teal-200">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-sm sm:text-base md:text-lg text-teal-900">
            Submissions ({pagination.totalCount || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-3 p-3">
              {submissions.map((submission) => (
                <Card key={submission._id} className="border-teal-100">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage
                              src={submission.user?.image}
                              alt={submission.user?.name}
                            />
                            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                              {submission.user?.name?.charAt(0) ||
                                submission.userName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-teal-900 text-sm truncate">
                              {submission.user?.name || submission.userName}
                            </p>
                            <p className="text-xs text-teal-600 truncate">
                              {submission.task?.title || "Unknown Task"}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(submission._id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {submission.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirmDialog(
                                      submission._id,
                                      "approve",
                                      submission.task?.title || "Unknown Task",
                                      submission.user?.name ||
                                        submission.userName,
                                      submission.task?.reward || 0
                                    )
                                  }
                                  disabled={reviewingSubmission}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirmDialog(
                                      submission._id,
                                      "reject",
                                      submission.task?.title || "Unknown Task",
                                      submission.user?.name ||
                                        submission.userName,
                                      submission.task?.reward || 0
                                    )
                                  }
                                  disabled={reviewingSubmission}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <Badge
                            className={getStatusColor(submission.status)}
                            size="sm"
                          >
                            {submission.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-teal-600">
                            <DollarSign className="h-3 w-3" />
                            <span>₹{submission.task?.reward || 0}</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="flex items-center justify-end gap-1 text-teal-600">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate(submission.submittedAt).split(",")[0]}
                            </span>
                          </div>
                          {submission.proofData?.images?.length > 0 && (
                            <div className="flex items-center justify-end gap-1 text-teal-600">
                              <FileImage className="h-3 w-3" />
                              <span>
                                {submission.proofData.images.length} images
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description Preview */}
                      {submission.proofData?.description && (
                        <div className="pt-1 border-t border-teal-100">
                          <p className="text-xs text-teal-600 line-clamp-2">
                            {submission.proofData.description}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons for Mobile */}
                      {submission.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              openConfirmDialog(
                                submission._id,
                                "approve",
                                submission.task?.title || "Unknown Task",
                                submission.user?.name || submission.userName,
                                submission.task?.reward || 0
                              )
                            }
                            disabled={reviewingSubmission}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() =>
                              openConfirmDialog(
                                submission._id,
                                "reject",
                                submission.task?.title || "Unknown Task",
                                submission.user?.name || submission.userName,
                                submission.task?.reward || 0
                              )
                            }
                            disabled={reviewingSubmission}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-teal-200">
                    <TableHead>User</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow
                      key={submission._id}
                      className="border-teal-100 hover:bg-teal-50 cursor-pointer"
                      onClick={() => handleViewDetails(submission._id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
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
                            <p className="font-medium text-teal-900">
                              {submission.user?.name || submission.userName}
                            </p>
                            <p className="text-sm text-teal-600">
                              {submission.userEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-teal-900">
                            {submission.task?.title || "Unknown Task"}
                          </p>
                          <p className="text-sm text-teal-600">
                            {submission.task?.category || "General"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {formatDate(submission.submittedAt)}
                          </p>
                          {submission.timeToSubmit && (
                            <p className="text-xs text-teal-600">
                              {submission.timeToSubmit}h to complete
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        {submission.reviewedAt && (
                          <p className="text-xs text-teal-600 mt-1">
                            Reviewed {formatDate(submission.reviewedAt)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {submission.proofData?.images?.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-teal-600">
                              <FileImage className="h-3 w-3" />
                              <span>{submission.proofData.images.length}</span>
                            </div>
                          )}
                          {submission.proofData?.links && (
                            <div className="flex items-center gap-1 text-xs text-teal-600">
                              <LinkIcon className="h-3 w-3" />
                              <span>Links</span>
                            </div>
                          )}
                          {submission.proofData?.description && (
                            <div className="text-xs text-teal-600">Text</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-teal-900">
                          ₹{submission.task?.reward || 0}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {submission.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 h-8"
                              onClick={() =>
                                openConfirmDialog(
                                  submission._id,
                                  "approve",
                                  submission.task?.title || "Unknown Task",
                                  submission.user?.name || submission.userName,
                                  submission.task?.reward || 0
                                )
                              }
                              disabled={reviewingSubmission}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() =>
                                openConfirmDialog(
                                  submission._id,
                                  "reject",
                                  submission.task?.title || "Unknown Task",
                                  submission.user?.name || submission.userName,
                                  submission.task?.reward || 0
                                )
                              }
                              disabled={reviewingSubmission}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewDetails(submission._id)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-t border-teal-200 gap-3 sm:gap-0">
              <p className="text-xs sm:text-sm text-teal-600 order-2 sm:order-1">
                {isMobile
                  ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
                      currentPage * pageSize,
                      pagination.totalCount
                    )} of ${pagination.totalCount}`
                  : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                      currentPage * pageSize,
                      pagination.totalCount
                    )} of ${pagination.totalCount} submissions`}
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!pagination.hasPrev}
                  className="border-teal-200 text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1" />
                  {isMobile ? "" : "Previous"}
                </Button>
                <span className="text-xs sm:text-sm text-teal-700 px-2">
                  {isMobile
                    ? `${currentPage}/${pagination.totalPages}`
                    : `Page ${currentPage} of ${pagination.totalPages}`}
                </span>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  disabled={!pagination.hasNext}
                  className="border-teal-200 text-xs sm:text-sm"
                >
                  {isMobile ? "" : "Next"}
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0 sm:ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
