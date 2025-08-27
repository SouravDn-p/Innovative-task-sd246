"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Eye,
  Flag,
  MessageSquare,
  Calendar,
  Wallet,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  useGetAdminTaskDetailsQuery,
  useGetTaskSubmissionsQuery,
  useReviewTaskSubmissionsMutation,
  useApproveTaskMutation,
  usePauseResumeTaskMutation,
  useCompleteTaskMutation,
} from "@/redux/api/api";

export default function TaskDetailsModal({ open, onClose, task }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSubmissions, setSelectedSubmissions] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkFeedback, setBulkFeedback] = useState("");
  const [actionNote, setActionNote] = useState("");

  const taskId = task?._id;

  const {
    data: taskDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetAdminTaskDetailsQuery(taskId, {
    skip: !taskId,
  });

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    refetch: refetchSubmissions,
  } = useGetTaskSubmissionsQuery(
    { taskId, status: "", page: 1, limit: 50 },
    { skip: !taskId }
  );

  const [reviewSubmissions] = useReviewTaskSubmissionsMutation();
  const [approveTask] = useApproveTaskMutation();
  const [pauseResumeTask] = usePauseResumeTaskMutation();
  const [completeTask] = useCompleteTaskMutation();

  if (!task || !open) return null;

  const details = taskDetails || {};
  const submissions = submissionsData?.submissions || [];
  const statistics = details.statistics || {};
  const paymentInfo = details.paymentInfo || {};
  const progress = details.progress || {};

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  const handleSelectAllSubmissions = () => {
    if (selectedSubmissions.size === submissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(submissions.map((sub) => sub._id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubmissions.size === 0) return;

    try {
      await reviewSubmissions({
        taskId,
        submissionIds: Array.from(selectedSubmissions),
        action: bulkAction,
        bulkReason: bulkFeedback,
      }).unwrap();

      setSelectedSubmissions(new Set());
      setBulkAction("");
      setBulkFeedback("");
      refetchSubmissions();
      refetchDetails();
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  const handleTaskAction = async (action) => {
    try {
      switch (action) {
        case "approve":
          await approveTask({ taskId, note: actionNote }).unwrap();
          break;
        case "pause":
          await pauseResumeTask({
            taskId,
            action: "pause",
            reason: actionNote,
          }).unwrap();
          break;
        case "resume":
          await pauseResumeTask({
            taskId,
            action: "resume",
            reason: actionNote,
          }).unwrap();
          break;
        case "complete":
          await completeTask({
            taskId,
            forceComplete: true,
            reason: actionNote,
          }).unwrap();
          break;
      }
      setActionNote("");
      refetchDetails();
    } catch (error) {
      console.error(`${action} action failed:`, error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Task Details: {task.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Title</Label>
                    <p className="font-medium">{task.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Type</Label>
                    <p className="capitalize">{task.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Description</Label>
                    <p className="text-sm">{task.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Status</Label>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Created By</Label>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={details.creator?.image} />
                        <AvatarFallback className="text-xs">
                          {details.creator?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{details.creator?.name || "Unknown"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Progress & Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">
                      Completion Progress
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-teal-500 h-3 rounded-full"
                          style={{ width: `${progress.percentage || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {progress.completed || 0}/{progress.limit || 0}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Assigned</Label>
                      <p className="text-lg font-bold text-blue-600">
                        {statistics.totalAssigned || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Completed</Label>
                      <p className="text-lg font-bold text-green-600">
                        {statistics.completedTasks || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Pending</Label>
                      <p className="text-lg font-bold text-yellow-600">
                        {statistics.pendingSubmissions || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Approved</Label>
                      <p className="text-lg font-bold text-teal-600">
                        {statistics.approvedSubmissions || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proof Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-gray-600">Type</Label>
                    <p className="capitalize">
                      {task.proofRequirements?.type || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Details</Label>
                    <p className="text-sm">
                      {task.proofRequirements?.details || "No details provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Submissions Management
                  </CardTitle>
                  {selectedSubmissions.size > 0 && (
                    <div className="flex items-center gap-2">
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approve</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleBulkAction}
                        disabled={!bulkAction}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        Apply to {selectedSubmissions.size}
                      </Button>
                    </div>
                  )}
                </div>
                {selectedSubmissions.size > 0 && (
                  <div className="mt-2">
                    <Textarea
                      placeholder="Bulk feedback (optional)"
                      value={bulkFeedback}
                      onChange={(e) => setBulkFeedback(e.target.value)}
                      className="h-16"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
                    <p>Loading submissions...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedSubmissions.size === submissions.length &&
                              submissions.length > 0
                            }
                            onCheckedChange={handleSelectAllSubmissions}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSubmissions.has(submission._id)}
                              onCheckedChange={() =>
                                handleSelectSubmission(submission._id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={submission.user?.image} />
                                <AvatarFallback className="text-xs">
                                  {submission.user?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {submission.user?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {submission.userEmail}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(submission.status)}
                            >
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ₹{submission.userTask?.payment || task.rateToUser}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {submission.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleBulkAction("approve", [
                                        submission._id,
                                      ])
                                    }
                                    className="h-7 text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleBulkAction("reject", [
                                        submission._id,
                                      ])
                                    }
                                    className="h-7 text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7"
                                onClick={() => {
                                  // View proof details
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">
                      Payment Status
                    </Label>
                    <Badge className={getStatusColor(paymentInfo.status)}>
                      {paymentInfo.status || "Unknown"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Total Budget Required
                    </Label>
                    <p className="text-lg font-bold text-blue-600">
                      ₹{(paymentInfo.totalBudgetRequired || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Amount Spent
                    </Label>
                    <p className="text-lg font-bold text-green-600">
                      ₹{(paymentInfo.totalSpent || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Remaining Budget
                    </Label>
                    <p className="text-lg font-bold text-orange-600">
                      ₹{(paymentInfo.remainingBudget || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Creator Wallet Balance
                    </Label>
                    <p className="text-lg font-bold text-teal-600">
                      ₹{(paymentInfo.creatorWalletBalance || 0).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Budget Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Rate per User:</span>
                    <span className="font-medium">
                      ₹{paymentInfo.rateToUser || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per User:</span>
                    <span className="font-medium">
                      ₹{paymentInfo.advertiserCost || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Users:</span>
                    <span className="font-medium">
                      {paymentInfo.expectedUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Users:</span>
                    <span className="font-medium">
                      {paymentInfo.actualUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Users:</span>
                    <span className="font-medium">
                      {paymentInfo.completedUsers || 0}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Can Continue:</span>
                      <span
                        className={
                          paymentInfo.canContinue
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {paymentInfo.canContinue ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Action Note (Optional)</Label>
                  <Textarea
                    placeholder="Add a note for this action..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {task.status === "pending" && (
                    <Button
                      onClick={() => handleTaskAction("approve")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Task
                    </Button>
                  )}

                  {task.status === "approved" && (
                    <Button
                      onClick={() => handleTaskAction("pause")}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Pause Task
                    </Button>
                  )}

                  {task.status === "paused" && (
                    <Button
                      onClick={() => handleTaskAction("resume")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resume Task
                    </Button>
                  )}

                  <Button
                    onClick={() => handleTaskAction("complete")}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Force Complete
                  </Button>
                </div>

                {details.auditInfo && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-sm text-yellow-800">
                        <AlertTriangle className="h-4 w-4 mr-2 inline" />
                        Audit Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          Flagged Submissions:{" "}
                          {details.auditInfo.flaggedSubmissions}
                        </div>
                        <div>
                          Suspicious Users: {details.auditInfo.suspiciousUsers}
                        </div>
                        <div>
                          Duplicate Proofs: {details.auditInfo.duplicateProofs}
                        </div>
                        <div>
                          Device Conflicts: {details.auditInfo.deviceConflicts}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
