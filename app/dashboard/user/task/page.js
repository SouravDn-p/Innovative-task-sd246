"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Clock,
  Users,
  CheckCircle,
  Camera,
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Upload,
  Eye,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Play,
  Send,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Award,
  Timer,
  Target,
} from "lucide-react";
import {
  useGetTasksQuery,
  useGetUserTasksGroupedQuery,
  useJoinTaskMutation,
  useSubmitTaskProofMutation,
  useGetKYCDataQuery,
} from "@/redux/api/api";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import Image from "next/image";

function TasksPageContent() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofData, setProofData] = useState({
    images: [],
    links: "",
    description: "",
  });
  const [submissionNote, setSubmissionNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showTaskJoinModal, setShowTaskJoinModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  // Fetch KYC data
  const {
    data: kycData,
    isLoading: kycLoading,
    error: kycError,
  } = useGetKYCDataQuery(undefined, {
    skip: !userEmail,
  });

  // API queries
  const {
    data: availableTasks = [],
    isLoading: loadingAvailable,
    refetch: refetchAvailable,
  } = useGetTasksQuery(undefined, {
    skip: !userEmail || kycData?.status !== "verified",
  });

  const {
    data: userTasks,
    isLoading: loadingUserTasks,
    refetch: refetchUserTasks,
  } = useGetUserTasksGroupedQuery(undefined, {
    skip: !userEmail || kycData?.status !== "verified",
  });

  // Mutations
  const [joinTask, { isLoading: joiningTask }] = useJoinTaskMutation();
  const [submitProof, { isLoading: submittingProof }] =
    useSubmitTaskProofMutation();

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
          // Redirect to KYC verification with return URL
          const redirectUrl = returnUrl || "/dashboard/tasks";
          router.push(
            `/dashboard/user/kyc-verification?returnUrl=${encodeURIComponent(
              redirectUrl
            )}`
          );
        }
      });
    }
  }, [status, kycData, router, returnUrl]);

  // Handle joining a task
  const handleJoinTask = async (taskId) => {
    if (!session?.user?.email) {
      Swal.fire({
        icon: "error",
        title: "Not logged in",
        text: "Please log in to join a task.",
        confirmButtonText: "Go to Login",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login");
        }
      });
      return;
    }

    if (kycData?.status !== "verified") {
      Swal.fire({
        icon: "warning",
        title: "KYC Verification Required",
        text: "You need to complete KYC verification to join tasks.",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Go to KYC Verification",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          const redirectUrl = `/dashboard/tasks?taskId=${taskId}`;
          router.push(
            `/dashboard/user/kyc-verification?returnUrl=${encodeURIComponent(
              redirectUrl
            )}`
          );
        }
      });
      return;
    }

    try {
      await joinTask({
        taskId,
        userEmail: session?.user?.email,
        userName: session?.user?.name || session?.user?.email?.split("@")[0],
      }).unwrap();
      refetchAvailable();
      refetchUserTasks();
      setShowTaskJoinModal(false);
      Swal.fire({
        icon: "success",
        title: "Task Joined!",
        text: "You have successfully joined the task.",
      });
    } catch (error) {
      console.error("Failed to join task:", error);
      // Enhanced error handling with more detailed messages
      let errorMessage = "Failed to join task";

      if (error?.data?.message) {
        errorMessage = error.data.message;
        // Add details if available
        if (error.data.details) {
          errorMessage += ": " + error.data.details;
        }
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  // Handle task details view
  const handleViewTaskDetails = (task) => {
    if (kycData?.status !== "verified") {
      Swal.fire({
        icon: "warning",
        title: "KYC Verification Required",
        text: "You need to complete KYC verification to view task details.",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Go to KYC Verification",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          const redirectUrl = `/dashboard/tasks?taskId=${task.id || task._id}`;
          router.push(
            `/dashboard/user/kyc-verification?returnUrl=${encodeURIComponent(
              redirectUrl
            )}`
          );
        }
      });
      return;
    }
    setSelectedTask(task);
    setShowTaskJoinModal(true);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const newImages = [...selectedImages, ...files].slice(0, 5); // Max 5 images
      setSelectedImages(newImages);

      // Create preview URLs
      const urls = newImages.map((file) => {
        if (typeof file === "string") return file; // Existing URL
        return URL.createObjectURL(file);
      });
      setPreviewUrls(urls);

      // Update proof data
      setProofData((prev) => ({
        ...prev,
        images: newImages,
      }));
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setPreviewUrls(newUrls);
    setProofData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  // Handle proof submission
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (kycData?.status !== "verified") {
      Swal.fire({
        icon: "warning",
        title: "KYC Verification Required",
        text: "You need to complete KYC verification to submit task proof.",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Go to KYC Verification",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(
            `/dashboard/user/kyc-verification?returnUrl=${encodeURIComponent(
              "/dashboard/tasks"
            )}`
          );
        }
      });
      return;
    }

    try {
      await submitProof({
        taskId: selectedTask.taskId || selectedTask.id || selectedTask._id,
        proofData,
        note: submissionNote,
      }).unwrap();

      // Reset form
      setSelectedTask(null);
      setProofData({ images: [], links: "", description: "" });
      setSubmissionNote("");
      setSelectedImages([]);
      setPreviewUrls([]);
      setShowSubmissionModal(false);
      refetchUserTasks();
      Swal.fire({
        icon: "success",
        title: "Proof Submitted!",
        text: "Your proof has been submitted for review.",
      });
    } catch (error) {
      console.error("Failed to submit proof:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.data?.message || "Failed to submit proof",
      });
    }
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
      case "approved":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const getRemainingTime = (endDate) => {
    if (!endDate) return "No deadline";
    const end = new Date(endDate);
    const now = new Date();
    const diffInMs = end - now;

    if (diffInMs <= 0) return "Expired";

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(
      (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} left`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} left`;
    } else {
      return "Less than 1 hour left";
    }
  };

  // New function to check if a task is live
  const isTaskLive = (task) => {
    const now = new Date();
    const startAt = new Date(task.startAt);
    const endAt = new Date(task.endAt);

    // Task is live if it has started, hasn't ended, and user hasn't joined it yet
    return now >= startAt && now <= endAt && task.remainingSlots > 0;
  };

  // New function to check if task has not started yet
  const isTaskNotStarted = (task) => {
    const now = new Date();
    const startAt = new Date(task.startAt);
    return now < startAt;
  };

  // New function to check if a task is already assigned to the user
  const isTaskAssigned = (task) => {
    // Check if task exists in any of the user's task lists
    const allUserTasks = [
      ...activeTasksData,
      ...pendingTasksData,
      ...completedTasksData,
    ];
    return allUserTasks.some(
      (userTask) =>
        userTask.taskId === task.id ||
        userTask.taskId === task._id ||
        userTask._id === task.id ||
        userTask._id === task._id
    );
  };

  // New function to get user task status
  const getUserTaskStatus = (task) => {
    // Check active tasks
    const activeTask = activeTasksData.find(
      (userTask) => userTask.taskId === task.id || userTask.taskId === task._id
    );
    if (activeTask) return "active";

    // Check pending tasks
    const pendingTask = pendingTasksData.find(
      (userTask) => userTask.taskId === task.id || userTask.taskId === task._id
    );
    if (pendingTask) return "pending";

    // Check completed tasks
    const completedTask = completedTasksData.find(
      (userTask) => userTask.taskId === task.id || userTask.taskId === task._id
    );
    if (completedTask) return "completed";

    return null;
  };

  // New function to format date for display
  const formatTaskDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeTasksData = userTasks?.active || [];
  const pendingTasksData = userTasks?.pending || [];
  const completedTasksData = userTasks?.completed || [];

  // Filter available tasks to exclude those already assigned to the user
  const filteredAvailableTasks = availableTasks.filter(
    (task) => !isTaskAssigned(task)
  );

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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
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
              <h1 className="text-lg font-bold text-teal-900">My Tasks</h1>
              <p className="text-xs text-teal-600 truncate max-w-[200px]">
                {userEmail ? `${userEmail}` : "Login to see your tasks"}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchAvailable();
                refetchUserTasks();
              }}
              className="border-teal-200 text-teal-700 hover:bg-teal-50 whitespace-nowrap text-xs py-1 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-2 sm:p-4">
        {/* Search Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-teal-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-teal-200 focus:border-teal-500 bg-white w-full text-sm h-8"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => router.push("/dashboard/user/task/pending")}
            variant="outline"
            className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 text-xs py-1 px-2 h-8"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending Tasks ({pendingTasksData.length})
          </Button>
          <Button
            onClick={() => router.push("/dashboard/user/task/completed")}
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50 text-xs py-1 px-2 h-8"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed Tasks ({completedTasksData.length})
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-3 sm:space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white border border-teal-200 overflow-x-auto h-9 min-h-0 p-0.5">
            <TabsTrigger
              value="available"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 text-xs py-1 px-0"
            >
              <span>Available</span>
              <span className="ml-1 text-xs">
                ({filteredAvailableTasks.length})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 text-xs py-1 px-0"
            >
              <span>Active</span>
              <span className="ml-1 text-xs">({activeTasksData.length})</span>
            </TabsTrigger>
          </TabsList>
          {/* Available Tasks */}
          <TabsContent value="available" className="space-y-4">
            {loadingAvailable ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-teal-700">Loading available tasks...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAvailableTasks.map((task) => {
                  const userTaskStatus = getUserTaskStatus(task);
                  const taskNotStarted = isTaskNotStarted(task);
                  const taskLive = isTaskLive(task);

                  return (
                    <Card
                      key={task.id || task._id}
                      className="hover:shadow-md transition-shadow border-teal-200 w-full"
                    >
                      <CardHeader className="pb-2 pt-3 px-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm text-teal-900 break-words">
                              {task.title}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 text-teal-600 break-words line-clamp-2">
                              {task.description}
                            </CardDescription>
                          </div>
                          <Badge
                            className={`${getStatusColor(
                              task.taskStatus
                            )} text-xs py-0.5 px-1.5`}
                          >
                            Available
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pb-3 pt-0">
                        <div className="space-y-2">
                          {/* Task dates and reward info */}
                          <div className="flex flex-wrap items-center justify-between text-xs gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-teal-700 flex items-center">
                                <DollarSign className="h-3 w-3 mr-0.5" />₹
                                {task.reward}
                              </span>
                              <div className="flex items-center gap-1 text-teal-600">
                                <Users className="h-3 w-3" />
                                {task.remaining}/{task.total}
                              </div>
                            </div>
                            {/* LIVE badge for active tasks */}
                            {taskLive && (
                              <Badge className="bg-red-500 text-white text-xs py-0.5 px-1.5 animate-pulse">
                                LIVE
                              </Badge>
                            )}
                            {!taskLive && (
                              <Badge
                                variant="outline"
                                className="border-teal-200 text-teal-700 whitespace-nowrap text-xs py-0 px-1.5"
                              >
                                {task.category}
                              </Badge>
                            )}
                          </div>

                          {/* Task timing information */}
                          <div className="text-xs text-teal-600 grid grid-cols-2 gap-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="truncate">
                                Start: {formatTaskDate(task.startAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="truncate">
                                End: {formatTaskDate(task.endAt)}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleViewTaskDetails(task)}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs"
                            disabled={
                              joiningTask ||
                              task.remaining === 0 ||
                              taskNotStarted ||
                              userTaskStatus === "pending" ||
                              userTaskStatus === "completed"
                            }
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {joiningTask
                              ? "Joining..."
                              : userTaskStatus === "completed"
                              ? "Done"
                              : userTaskStatus === "pending"
                              ? "Pending"
                              : taskNotStarted
                              ? "Not Started"
                              : "View & Join"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Active Tasks */}
          <TabsContent value="active" className="space-y-3">
            {loadingUserTasks ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
                <p className="text-teal-700 text-sm">Loading your tasks...</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {activeTasksData.map((task) => (
                  <Card
                    key={task._id}
                    className="hover:shadow-md transition-shadow border-teal-200 w-full"
                  >
                    <CardHeader className="pb-2 pt-3 px-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm text-teal-900 break-words">
                            {task.task?.title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1 text-teal-600 break-words line-clamp-2">
                            {task.task?.description}
                          </CardDescription>
                        </div>
                        <Badge
                          className={`${getStatusColor(
                            "active"
                          )} text-xs py-0.5 px-1.5`}
                        >
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0">
                      <div className="space-y-2">
                        {/* Payment and timing info */}
                        <div className="flex flex-wrap items-center justify-between text-xs gap-1">
                          <span className="font-semibold text-teal-700 flex items-center">
                            <DollarSign className="h-3 w-3 mr-0.5" />₹
                            {task.payment}
                          </span>
                          {task.task?.endAt && (
                            <div className="flex items-center gap-1 text-teal-600 text-xs">
                              <Clock className="h-3 w-3" />
                              Ends {formatTaskDate(task.task.endAt)}
                            </div>
                          )}
                        </div>

                        {/* Task timing information */}
                        {task.task?.startAt && task.task?.endAt && (
                          <div className="text-xs text-teal-600 grid grid-cols-2 gap-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="truncate">
                                Start: {formatTaskDate(task.task.startAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="truncate">
                                End: {formatTaskDate(task.task.endAt)}
                              </span>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowSubmissionModal(true);
                          }}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs"
                          disabled={
                            task.submission?.status === "pending" ||
                            task.submission?.status === "approved"
                          }
                        >
                          <Send className="h-3 w-3 mr-1" />
                          {task.submission?.status === "pending"
                            ? "Pending Review"
                            : task.submission?.status === "approved"
                            ? "Completed"
                            : "Submit Proof"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Submission Modal */}
      <Dialog open={showSubmissionModal} onOpenChange={setShowSubmissionModal}>
        <DialogContent className="max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto p-3 sm:p-4">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="text-base text-teal-900">
              Submit Proof
            </DialogTitle>
            <DialogDescription className="break-words text-xs">
              Upload proof for: {selectedTask?.task?.title}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitProof} className="space-y-3">
            {/* Image Upload Section */}
            <div className="space-y-1">
              <Label className="text-xs">Upload Images (Optional)</Label>
              <div className="border-2 border-dashed border-teal-200 rounded-lg p-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50 text-xs py-1 px-2 h-auto"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Add Images
                  </Button>
                  <p className="text-xs text-teal-600 mt-1">
                    Max 5 images, 10MB each
                  </p>
                </div>

                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <div className="w-full h-16 bg-teal-100 rounded border border-teal-200 flex items-center justify-center overflow-hidden">
                          <ImageIcon className="h-6 w-6 text-teal-600" />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs">
                Proof Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what you did to complete this task..."
                value={proofData.description}
                onChange={(e) =>
                  setProofData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="border-teal-200 focus:border-teal-500 w-full text-xs resize-none"
                required
              />
            </div>

            {/* Links */}
            <div className="space-y-1">
              <Label htmlFor="links" className="text-xs">
                Links (if applicable)
              </Label>
              <Input
                id="links"
                placeholder="Paste relevant links here"
                value={proofData.links}
                onChange={(e) =>
                  setProofData((prev) => ({
                    ...prev,
                    links: e.target.value,
                  }))
                }
                className="border-teal-200 focus:border-teal-500 w-full text-xs h-8"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-1">
              <Label htmlFor="note" className="text-xs">
                Additional Notes
              </Label>
              <Textarea
                id="note"
                placeholder="Any additional information for the reviewer..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                rows={2}
                className="border-teal-200 focus:border-teal-500 w-full text-xs resize-none"
              />
            </div>

            <DialogFooter className="flex flex-row gap-2 pt-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSubmissionModal(false);
                  setSelectedImages([]);
                  setPreviewUrls([]);
                  setProofData({ images: [], links: "", description: "" });
                  setSubmissionNote("");
                }}
                className="border-teal-200 text-teal-700 text-xs py-1 px-2 h-7"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingProof || !proofData.description.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-xs py-1 px-2 h-7"
              >
                {submittingProof ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Join Modal */}
      <Dialog open={showTaskJoinModal} onOpenChange={setShowTaskJoinModal}>
        <DialogContent className="max-w-full sm:max-w-md mx-2 sm:mx-auto p-3 sm:p-4">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="text-base text-teal-900 break-words">
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review task details before joining
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-3">
              <div className="bg-teal-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm text-teal-900 mb-1">
                  Task Overview
                </h4>
                <p className="text-xs text-teal-700 mb-2 break-words">
                  {selectedTask.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-teal-600" />
                    <span className="font-medium text-teal-900">
                      ₹{selectedTask.reward || selectedTask.rateToUser}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3 text-teal-600" />
                    <span className="text-teal-700">
                      {selectedTask.estimatedTime || "30 mins"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-teal-600" />
                    <span className="text-teal-700">
                      {selectedTask.remainingSlots || selectedTask.remaining}{" "}
                      slots left
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-teal-600" />
                    <span className="text-teal-700">
                      {getRemainingTime(selectedTask.endAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Task timing information */}
              <div className="bg-amber-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm text-amber-900 mb-1">
                  Task Schedule
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-600" />
                    <span className="text-amber-700">
                      Start: {formatTaskDate(selectedTask.startAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span className="text-amber-700">
                      End: {formatTaskDate(selectedTask.endAt)}
                    </span>
                  </div>
                </div>
                {isTaskLive(selectedTask) && (
                  <div className="mt-2">
                    <Badge className="bg-red-500 text-white text-xs py-0.5 px-1.5 animate-pulse">
                      LIVE - Join now!
                    </Badge>
                  </div>
                )}
                {isTaskNotStarted(selectedTask) && (
                  <div className="mt-2">
                    <Badge className="bg-yellow-500 text-white text-xs py-0.5 px-1.5">
                      Not Started
                    </Badge>
                  </div>
                )}
              </div>

              {/* Fix the requirements rendering to handle non-array values */}
              {selectedTask.requirements &&
                (Array.isArray(selectedTask.requirements) ? (
                  selectedTask.requirements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-teal-900 mb-1">
                        Requirements
                      </h4>
                      <ul className="text-xs text-teal-700 space-y-1">
                        {selectedTask.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-teal-500 mt-0.5">•</span>
                            <span className="break-words">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ) : typeof selectedTask.requirements === "string" ? (
                  <div>
                    <h4 className="font-medium text-sm text-teal-900 mb-1">
                      Requirements
                    </h4>
                    <p className="text-xs text-teal-700 break-words">
                      {selectedTask.requirements}
                    </p>
                  </div>
                ) : null)}

              {selectedTask.proofRequirements && (
                <div>
                  <h4 className="font-medium text-sm text-teal-900 mb-1">
                    What to Submit
                  </h4>
                  <p className="text-xs text-teal-700 break-words">
                    {selectedTask.proofRequirements.details ||
                      selectedTask.proofRequirements ||
                      "Follow the task instructions and submit proof of completion."}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-row gap-2 pt-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowTaskJoinModal(false)}
              className="border-teal-200 text-teal-700 text-xs py-1 px-2 h-7"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleJoinTask(selectedTask?.id || selectedTask?._id)
              }
              disabled={joiningTask}
              className="bg-teal-600 hover:bg-teal-700 text-xs py-1 px-2 h-7"
            >
              {joiningTask ? "Joining..." : "Join Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TasksPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <TasksPageContent />
    </Suspense>
  );
}

export default TasksPage;
