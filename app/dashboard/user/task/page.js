"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
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
} from "@/redux/api/api";
import { useSession } from "next-auth/react";
import Image from "next/image";

function TasksPage() {
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
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showTaskJoinModal, setShowTaskJoinModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  // API queries
  const {
    data: availableTasks = [],
    isLoading: loadingAvailable,
    refetch: refetchAvailable,
  } = useGetTasksQuery();

  const {
    data: userTasks,
    isLoading: loadingUserTasks,
    refetch: refetchUserTasks,
  } = useGetUserTasksGroupedQuery(undefined, {
    skip: !userEmail,
  });

  // Mutations
  const [joinTask, { isLoading: joiningTask }] = useJoinTaskMutation();
  const [submitProof, { isLoading: submittingProof }] =
    useSubmitTaskProofMutation();

  // Handle joining a task
  const handleJoinTask = async (taskId) => {
    try {
      await joinTask({
        taskId,
        userEmail: session?.user?.email,
        userName: session?.user?.name || session?.user?.email?.split("@")[0],
      }).unwrap();
      refetchAvailable();
      refetchUserTasks();
      setShowTaskDetails(false);
      setShowTaskJoinModal(false);
    } catch (error) {
      console.error("Failed to join task:", error);
    }
  };

  // Handle task details view
  const handleViewTaskDetails = (task) => {
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
    try {
      await submitProof({
        taskId: selectedTask.taskId || selectedTask.id,
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
    } catch (error) {
      console.error("Failed to submit proof:", error);
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

  const activeTasksData = userTasks?.active || [];
  const pendingTasksData = userTasks?.pending || [];
  const completedTasksData = userTasks?.completed || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-teal-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-teal-700 hover:bg-teal-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-teal-900">My Tasks</h1>
            <p className="text-sm text-teal-600">
              {userEmail ? `Tasks for ${userEmail}` : "Login to see your tasks"}
            </p>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchAvailable();
                refetchUserTasks();
              }}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-teal-200 focus:border-teal-500 bg-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white border border-teal-200">
            <TabsTrigger
              value="available"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              Available ({availableTasks.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              Active ({activeTasksData.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              Pending ({pendingTasksData.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
            >
              Completed ({completedTasksData.length})
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
                {availableTasks.map((task) => (
                  <Card
                    key={task.id || task._id}
                    className="hover:shadow-md transition-shadow border-teal-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base text-teal-900">
                            {task.title}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1 text-teal-600">
                            {task.description}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(task.taskStatus)}>
                          Available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-teal-700 flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />₹
                              {task.reward}
                            </span>
                            <div className="flex items-center gap-1 text-teal-600">
                              <Users className="h-3 w-3" />
                              {task.remaining}/{task.total}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-teal-200 text-teal-700"
                          >
                            {task.category}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleJoinTask(task.id || task._id)}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                          disabled={joiningTask || task.remaining === 0}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {joiningTask ? "Joining..." : "View & Join"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Tasks */}
          <TabsContent value="active" className="space-y-4">
            {loadingUserTasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-teal-700">Loading your tasks...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeTasksData.map((task) => (
                  <Card
                    key={task._id}
                    className="hover:shadow-md transition-shadow border-teal-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base text-teal-900">
                            {task.task?.title}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1 text-teal-600">
                            {task.task?.description}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor("active")}>
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-teal-700 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />₹
                            {task.payment}
                          </span>
                          {task.task?.endAt && (
                            <div className="flex items-center gap-1 text-teal-600">
                              <Clock className="h-3 w-3" />
                              Ends {formatDate(task.task.endAt)}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowSubmissionModal(true);
                          }}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Proof
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Submissions */}
          <TabsContent value="pending" className="space-y-4">
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
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingTasksData.map((task) => {
                  const submission = task.submission;
                  return (
                    <Card key={task._id} className="border-yellow-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base text-teal-900 mb-1">
                              {task.task?.title}
                            </CardTitle>
                            <CardDescription className="text-sm text-yellow-600">
                              Submitted{" "}
                              {formatRelativeTime(submission?.submittedAt)}
                            </CardDescription>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending Review
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-teal-600" />
                              <span className="font-semibold text-teal-900">
                                ₹{task.payment}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <span className="text-yellow-700">
                                Under Review
                              </span>
                            </div>
                          </div>

                          {submission?.proofData?.description && (
                            <div className="text-xs text-teal-600 bg-teal-50 p-2 rounded">
                              <p className="font-medium mb-1">Your note:</p>
                              <p className="line-clamp-2">
                                {submission.proofData.description}
                              </p>
                            </div>
                          )}

                          {submission?.proofData?.images?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-teal-700 mb-2">
                                Submitted Images:
                              </p>
                              <div className="flex gap-2 overflow-x-auto">
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
          </TabsContent>

          {/* Completed Tasks */}
          <TabsContent value="completed" className="space-y-4">
            {loadingUserTasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-teal-700">Loading completed tasks...</p>
              </div>
            ) : completedTasksData.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-teal-900 mb-2">
                  No Completed Tasks
                </h3>
                <p className="text-teal-600">
                  Your approved tasks will appear here with reward details!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedTasksData.map((task) => {
                  const submission = task.submission;
                  return (
                    <Card key={task._id} className="border-green-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base text-teal-900 mb-1">
                              {task.task?.title}
                            </CardTitle>
                            <CardDescription className="text-sm text-green-600">
                              Completed{" "}
                              {formatRelativeTime(submission?.reviewedAt)}
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-900">
                                ₹{task.payment}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-700 font-medium">
                                Reward Credited 💰
                              </span>
                            </div>
                          </div>

                          {submission?.proofData?.images?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-teal-700 mb-2">
                                Your proof:
                              </p>
                              <div className="flex gap-2 overflow-x-auto">
                                {submission.proofData.images
                                  .slice(0, 4)
                                  .map((image, index) => (
                                    <div key={index} className="flex-shrink-0">
                                      <div className="w-12 h-12 bg-green-100 rounded border border-green-200 flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-green-600" />
                                      </div>
                                    </div>
                                  ))}
                                {submission.proofData.images.length > 4 && (
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 rounded border border-green-200 flex items-center justify-center text-xs text-green-600">
                                      +{submission.proofData.images.length - 4}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="bg-green-50 p-2 rounded text-xs text-green-700">
                            <p className="font-medium">
                              Task completed successfully!
                            </p>
                            <p>
                              Payment processed on{" "}
                              {formatDate(submission?.reviewedAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Submission Modal */}
      <Dialog open={showSubmissionModal} onOpenChange={setShowSubmissionModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-teal-900">Submit Proof</DialogTitle>
            <DialogDescription>
              Upload proof of completion for: {selectedTask?.task?.title}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitProof} className="space-y-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Upload Images (Optional)</Label>
              <div className="border-2 border-dashed border-teal-200 rounded-lg p-4">
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
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Add Images
                  </Button>
                  <p className="text-sm text-teal-600 mt-2">
                    Max 5 images, 10MB each
                  </p>
                </div>

                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <div className="w-full h-20 bg-teal-100 rounded border border-teal-200 flex items-center justify-center overflow-hidden">
                          <ImageIcon className="h-8 w-8 text-teal-600" />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Proof Description *</Label>
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
                rows={4}
                className="border-teal-200 focus:border-teal-500"
                required
              />
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Label htmlFor="links">Links (if applicable)</Label>
              <Input
                id="links"
                placeholder="Paste relevant links here (one per line)"
                value={proofData.links}
                onChange={(e) =>
                  setProofData((prev) => ({
                    ...prev,
                    links: e.target.value,
                  }))
                }
                className="border-teal-200 focus:border-teal-500"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="note">Additional Notes</Label>
              <Textarea
                id="note"
                placeholder="Any additional information for the reviewer..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                rows={2}
                className="border-teal-200 focus:border-teal-500"
              />
            </div>

            <DialogFooter>
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
                className="border-teal-200 text-teal-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingProof || !proofData.description.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {submittingProof ? "Submitting..." : "Submit for Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Join Modal */}
      <Dialog open={showTaskJoinModal} onOpenChange={setShowTaskJoinModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-teal-900">
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              Review task details before joining
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-medium text-teal-900 mb-2">
                  Task Overview
                </h4>
                <p className="text-sm text-teal-700 mb-3">
                  {selectedTask.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-teal-600" />
                    <span className="font-medium text-teal-900">
                      ₹{selectedTask.reward || selectedTask.rateToUser}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-teal-600" />
                    <span className="text-teal-700">
                      {selectedTask.estimatedTime || "30 mins"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-600" />
                    <span className="text-teal-700">
                      {selectedTask.remainingSlots || selectedTask.remaining}{" "}
                      slots left
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-600" />
                    <span className="text-teal-700">
                      {getRemainingTime(selectedTask.endAt)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTask.requirements?.length > 0 && (
                <div>
                  <h4 className="font-medium text-teal-900 mb-2">
                    Requirements
                  </h4>
                  <ul className="text-sm text-teal-700 space-y-1">
                    {selectedTask.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-teal-500 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTask.proofRequirements && (
                <div>
                  <h4 className="font-medium text-teal-900 mb-2">
                    What to Submit
                  </h4>
                  <p className="text-sm text-teal-700">
                    {selectedTask.proofRequirements.details ||
                      "Follow the task instructions and submit proof of completion."}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTaskJoinModal(false)}
              className="border-teal-200 text-teal-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleJoinTask(selectedTask?.id || selectedTask?._id)
              }
              disabled={joiningTask}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {joiningTask ? "Joining..." : "Join This Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TasksPage;
