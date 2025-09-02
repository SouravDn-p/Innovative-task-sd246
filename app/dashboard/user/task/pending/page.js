"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Award,
  ImageIcon,
  Link as LinkIcon,
  ArrowLeft,
} from "lucide-react";
import {
  useGetUserTasksGroupedQuery,
  useGetKYCDataQuery,
} from "@/redux/api/api";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

export default function PendingTasksPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  // Fetch KYC data
  const { data: kycData, isLoading: kycLoading } = useGetKYCDataQuery(
    undefined,
    {
      skip: !userEmail,
    }
  );

  const {
    data: userTasks,
    isLoading: loadingUserTasks,
    refetch: refetchUserTasks,
  } = useGetUserTasksGroupedQuery(undefined, {
    skip: !userEmail || kycData?.status !== "verified",
  });

  const pendingTasksData = userTasks?.pending || [];

  // Check KYC status and redirect if not verified
  useEffect(() => {
    if (
      status === "authenticated" &&
      kycData &&
      kycData.status !== "verified"
    ) {
      Swal.fire({
        icon: "warning",
        title: "KYC Verification Required",
        text: "You need to complete KYC verification to access tasks.",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Go to KYC Verification",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/dashboard/user/kyc-verification");
        }
      });
    }
  }, [status, kycData, router]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (status === "loading" || kycLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-teal-200 p-2 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-teal-700 hover:bg-teal-100 p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-teal-900">Pending Tasks</h1>
              <p className="text-xs text-teal-600 truncate max-w-[200px]">
                {userEmail ? `${userEmail}` : "Login to see your tasks"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-2 sm:p-4">
        {loadingUserTasks ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-teal-700">Loading pending submissions...</p>
          </div>
        ) : pendingTasksData.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-teal-900 mb-2">
              No Pending Submissions
            </h3>
            <p className="text-teal-600">
              Submit proof for your active tasks to see them here!
            </p>
            <Button
              onClick={() => router.push("/dashboard/user/task")}
              className="mt-4 bg-teal-600 hover:bg-teal-700"
            >
              View Available Tasks
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingTasksData.map((task) => {
              const submission = task.submission;
              return (
                <Card key={task._id} className="border-yellow-200 w-full">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-teal-900 mb-1 break-words">
                          {task.task?.title}
                        </CardTitle>
                        <p className="text-sm text-yellow-600">
                          Submitted{" "}
                          {formatRelativeTime(submission?.submittedAt)}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 whitespace-nowrap">
                        Pending Review
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-teal-600" />
                          <span className="font-semibold text-teal-900">
                            ₹{task.payment}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-700">Under Review</span>
                        </div>
                      </div>

                      {submission?.proofData?.description && (
                        <div className="text-xs text-teal-600 bg-teal-50 p-2 rounded">
                          <p className="font-medium mb-1">Your note:</p>
                          <p className="line-clamp-2 break-words">
                            {submission.proofData.description}
                          </p>
                        </div>
                      )}

                      {submission?.proofData?.images?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-teal-700 mb-2">
                            Submitted Images:
                          </p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {submission.proofData.images
                              .slice(0, 3)
                              .map((image, index) => (
                                <div key={index} className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-teal-100 rounded border border-teal-200 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-teal-600" />
                                  </div>
                                </div>
                              ))}
                            {submission.proofData.images.length > 3 && (
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-teal-100 rounded border border-teal-200 flex items-center justify-center text-xs text-teal-600">
                                  +{submission.proofData.images.length - 3}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {submission?.proofData?.links && (
                        <div className="text-xs text-teal-600">
                          <p className="font-medium flex items-center mb-1">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Links submitted
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
