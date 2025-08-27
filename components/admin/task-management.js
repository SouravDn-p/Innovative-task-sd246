"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  CheckCircle,
  X,
  Eye,
  Clock,
  AlertTriangle,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
import {
  useGetMyTaskSubmissionsQuery,
  useReviewMyTaskSubmissionMutation,
} from "@/redux/api/api";

export function TaskManagement({ userRole }) {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const {
    data: pendingSubmissions = [],
    isLoading,
    error,
  } = useGetMyTaskSubmissionsQuery({
    status: "pending",
  });
  const [reviewTaskSubmission, { isLoading: isReviewing }] =
    useReviewMyTaskSubmissionMutation();

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApproveSubmission = async (submissionId) => {
    try {
      await reviewTaskSubmission({
        submissionId,
        status: "approved",
        feedback: reviewNotes,
      }).unwrap();
      setReviewNotes("");
    } catch (error) {
      console.error("Failed to approve submission:", error);
    }
  };

  const handleRejectSubmission = async (submissionId, reason) => {
    try {
      await reviewTaskSubmission({
        submissionId,
        status: "rejected",
        feedback: reason || reviewNotes,
      }).unwrap();
      setReviewNotes("");
    } catch (error) {
      console.error("Failed to reject submission:", error);
    }
  };

  const canReviewTasks =
    userRole === "super_admin" || userRole === "task_manager";

  if (!canReviewTasks) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access task management features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6">Loading task submissions...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading submissions: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Review and manage task submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-50">
            {pendingSubmissions.filter((s) => s.status === "pending").length}{" "}
            Pending
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            {pendingSubmissions.filter((s) => s.flagged).length} Flagged
          </Badge>
        </div>
      </div>

      {/* Pending Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>
            Task submissions awaiting review and approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task & User</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSubmissions.map((submission) => (
                <TableRow
                  key={submission.id}
                  className={
                    submission.flagged ? "bg-red-50 dark:bg-red-950" : ""
                  }
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.taskTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        by {submission.userName} ({submission.userId})
                      </p>
                      {submission.flagged && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-600">
                            {submission.flagReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{submission.submittedAt}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">₹{submission.reward}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              Review Submission - {submission.id}
                            </DialogTitle>
                            <DialogDescription>
                              Task: {submission.taskTitle} by{" "}
                              {submission.userName}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Submission Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <span className="font-medium">Task:</span>{" "}
                                      {selectedSubmission.taskTitle}
                                    </p>
                                    <p>
                                      <span className="font-medium">User:</span>{" "}
                                      {selectedSubmission.userName} (
                                      {selectedSubmission.userId})
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Submitted:
                                      </span>{" "}
                                      {selectedSubmission.submittedAt}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Reward:
                                      </span>{" "}
                                      ₹{selectedSubmission.reward}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Status</h4>
                                  <div className="space-y-2">
                                    <Badge
                                      className={getStatusColor(
                                        selectedSubmission.status
                                      )}
                                    >
                                      {selectedSubmission.status}
                                    </Badge>
                                    {selectedSubmission.flagged && (
                                      <div className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200">
                                        <div className="flex items-center gap-2">
                                          <AlertTriangle className="h-4 w-4 text-red-500" />
                                          <span className="text-sm font-medium text-red-700">
                                            Flagged
                                          </span>
                                        </div>
                                        <p className="text-xs text-red-600 mt-1">
                                          {selectedSubmission.flagReason}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">
                                  User Description
                                </h4>
                                <p className="text-sm bg-muted p-3 rounded">
                                  {selectedSubmission.description}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">
                                  Proof Submitted
                                </h4>
                                <div className="space-y-3">
                                  {selectedSubmission.proofImages?.length >
                                    0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Images:
                                      </p>
                                      <div className="flex gap-2">
                                        {selectedSubmission.proofImages.map(
                                          (image, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center gap-2 p-2 bg-muted rounded"
                                            >
                                              <ImageIcon className="h-4 w-4" />
                                              <span className="text-sm">
                                                {image}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {selectedSubmission.proofLinks?.length >
                                    0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Links:
                                      </p>
                                      <div className="space-y-1">
                                        {selectedSubmission.proofLinks.map(
                                          (link, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center gap-2 p-2 bg-muted rounded"
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                              <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                              >
                                                {link}
                                              </a>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-semibold">
                                  Review Decision
                                </h4>
                                <Textarea
                                  placeholder="Add review notes (optional)..."
                                  rows={3}
                                  value={reviewNotes}
                                  onChange={(e) =>
                                    setReviewNotes(e.target.value)
                                  }
                                />
                                <div className="flex gap-2">
                                  <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() =>
                                      handleApproveSubmission(
                                        selectedSubmission.id
                                      )
                                    }
                                    disabled={isReviewing}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isReviewing
                                      ? "Processing..."
                                      : "Approve & Pay"}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleRejectSubmission(
                                        selectedSubmission.id,
                                        "Invalid proof"
                                      )
                                    }
                                    disabled={isReviewing}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button variant="outline">
                                    Request More Info
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveSubmission(submission.id)}
                        disabled={isReviewing}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleRejectSubmission(submission.id, "Invalid proof")
                        }
                        disabled={isReviewing}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
