"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Download,
  Upload,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import {
  useGetAdminTasksQuery,
  useApproveTaskMutation,
  usePauseResumeTaskMutation,
  useCompleteTaskMutation,
  useDeleteAdminTaskMutation,
} from "@/redux/api/api";
import TaskDetailsModal from "@/components/admin/task-details-modal";
import { useIsMobile } from "@/hooks/use-mobiles";

export default function AdminTasksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [createdByFilter, setCreatedByFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Track which action is loading
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const isMobile = useIsMobile();

  // API queries and mutations
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useGetAdminTasksQuery({
    page: currentPage,
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : "",
    paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : "",
    taskType: taskTypeFilter !== "all" ? taskTypeFilter : "",
    createdBy: createdByFilter !== "all" ? createdByFilter : "",
    sortBy,
    sortOrder,
  });

  const [approveTask] = useApproveTaskMutation();
  const [pauseResumeTask] = usePauseResumeTaskMutation();
  const [completeTask] = useCompleteTaskMutation();
  const [deleteTask] = useDeleteAdminTaskMutation();

  const tasks = tasksData?.tasks || [];
  const pagination = tasksData?.pagination || {};
  const statistics = tasksData?.statistics || {};

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "paused":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map((task) => task._id)));
    }
  };

  const handleTaskAction = async (action, taskId, data = {}) => {
    try {
      setActionLoading(`${action}-${taskId}`);
      setErrorMessage(null);
      setSuccessMessage(null);

      switch (action) {
        case "approve":
          console.log("[ADMIN TASK] Approving task:", {
            taskId,
            note: data.note || "Admin approval",
          });
          const approvalResult = await approveTask({
            taskId,
            note: data.note || "Admin approval",
          }).unwrap();
          console.log(
            "[ADMIN TASK] Task approved successfully:",
            approvalResult
          );
          setSuccessMessage("Task approved successfully!");
          break;
        case "pause":
          await pauseResumeTask({ taskId, action: "pause", ...data }).unwrap();
          setSuccessMessage("Task paused successfully!");
          break;
        case "resume":
          await pauseResumeTask({ taskId, action: "resume", ...data }).unwrap();
          setSuccessMessage("Task resumed successfully!");
          break;
        case "complete":
          await completeTask({ taskId, ...data }).unwrap();
          setSuccessMessage("Task completed successfully!");
          break;
        case "delete":
          await deleteTask({ taskId, ...data }).unwrap();
          setSuccessMessage("Task deleted successfully!");
          break;
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      refetch();
    } catch (error) {
      console.error(`[ADMIN TASK] Failed to ${action} task:`, {
        action,
        taskId,
        error: error,
        errorData: error?.data,
        errorMessage: error?.message,
        errorStatus: error?.status,
        errorStack: error?.stack,
      });

      // More specific error messages
      let errorMessage = "Unknown error occurred";
      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      console.log(`[ADMIN TASK] Displaying error message: ${errorMessage}`);
      setErrorMessage(`Failed to ${action} task: ${errorMessage}`);

      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setTaskTypeFilter("all");
    setCreatedByFilter("all");
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">
              Error Loading Tasks
            </h2>
            <p className="text-red-600 mb-4">
              {error?.data?.message || "Failed to load tasks"}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-teal-600">Total Tasks</p>
                <p className="text-lg sm:text-2xl font-bold text-teal-900">
                  {statistics.totalTasks || 0}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-yellow-600">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-900">
                  {statistics.pendingTasks || 0}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-green-600">Running</p>
                <p className="text-lg sm:text-2xl font-bold text-green-900">
                  {statistics.runningTasks || 0}
                </p>
              </div>
              <Play className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-600">
                  Budget Locked
                </p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900">
                  ₹{(statistics.totalBudgetLocked || 0).toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <Label className="text-xs sm:text-sm">Search Tasks</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-teal-400" />
                <Input
                  placeholder={
                    isMobile
                      ? "Search tasks..."
                      : "Search by title, creator, description..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Running</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Payment Status</Label>
              <Select
                value={paymentStatusFilter}
                onValueChange={setPaymentStatusFilter}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Task Type</Label>
              <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="install">Install</SelectItem>
                  <SelectItem value="share">Share</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Created By</Label>
              <Select
                value={createdByFilter}
                onValueChange={setCreatedByFilter}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Creators" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Creators</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="advertiser">Advertiser</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full text-sm"
                size={isMobile ? "sm" : "default"}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-sm sm:text-base md:text-lg">
              Task Management
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size={isMobile ? "sm" : "default"}
                className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-initial"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {isMobile ? "Create" : "Create Task"}
              </Button>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="flex-1 sm:flex-initial"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-teal-700">Loading tasks...</p>
            </div>
          ) : (
            <>
              {isMobile ? (
                // Mobile Card View
                <div className="space-y-3 p-3">
                  {tasks.map((task) => (
                    <Card key={task._id} className="border-teal-100">
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          {/* Task Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <Checkbox
                                checked={selectedTasks.has(task._id)}
                                onCheckedChange={() =>
                                  handleSelectTask(task._id)
                                }
                                className="shrink-0 mt-1"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-teal-900 text-sm leading-tight break-words">
                                  {task.title}
                                </p>
                                <p className="text-xs text-teal-600 capitalize mt-1">
                                  {task.type} Task
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
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskDetails(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {task.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleTaskAction("approve", task._id)
                                    }
                                    disabled={
                                      actionLoading === `approve-${task._id}`
                                    }
                                  >
                                    {actionLoading === `approve-${task._id}` ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    {actionLoading === `approve-${task._id}`
                                      ? "Approving..."
                                      : "Approve"}
                                  </DropdownMenuItem>
                                )}
                                {task.status === "approved" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleTaskAction("pause", task._id, {
                                        reason: "Admin pause",
                                      })
                                    }
                                  >
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause
                                  </DropdownMenuItem>
                                )}
                                {task.status === "paused" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleTaskAction("resume", task._id, {
                                        reason: "Admin resume",
                                      })
                                    }
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Resume
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTaskAction("complete", task._id, {
                                      forceComplete: true,
                                      reason: "Admin completion",
                                    })
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleTaskAction("delete", task._id, {
                                      reason: "Admin deletion",
                                      confirmDelete: true,
                                    })
                                  }
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Status and Payment Badges */}
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            <Badge
                              className={getPaymentStatusColor(
                                task.paymentStatusCalc
                              )}
                            >
                              {task.paymentStatusCalc}
                            </Badge>
                          </div>

                          {/* Reward and Progress */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-gray-600">User Reward</p>
                              <p className="font-medium">₹{task.rateToUser}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Progress</p>
                              <p className="font-medium">
                                {task.completedCount || 0}/{task.limitCount}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((task.completedCount || 0) /
                                      task.limitCount) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Creator Info */}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.creator?.image} />
                              <AvatarFallback className="text-xs bg-teal-100">
                                {task.creator?.name?.charAt(0) ||
                                  task.createdBy?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">
                                {task.creator?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {task.createdBy}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Desktop Table View
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedTasks.size === tasks.length &&
                            tasks.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Task & Type</TableHead>
                      <TableHead>Reward & Cost</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedTasks.has(task._id)}
                            onCheckedChange={() => handleSelectTask(task._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-teal-900">
                              {task.title}
                            </p>
                            <p className="text-sm text-teal-600 capitalize">
                              {task.type} Task
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              User:{" "}
                              <span className="font-medium">
                                ₹{task.rateToUser}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Cost: ₹{task.advertiserCost}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {task.completedCount || 0}/{task.limitCount}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-teal-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((task.completedCount || 0) /
                                      task.limitCount) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPaymentStatusColor(
                              task.paymentStatusCalc
                            )}
                          >
                            {task.paymentStatusCalc}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.creator?.image} />
                              <AvatarFallback className="text-xs bg-teal-100">
                                {task.creator?.name?.charAt(0) ||
                                  task.createdBy?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {task.creator?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {task.createdBy}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowTaskDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {task.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTaskAction("approve", task._id)
                                  }
                                  disabled={
                                    actionLoading === `approve-${task._id}`
                                  }
                                >
                                  {actionLoading === `approve-${task._id}` ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  {actionLoading === `approve-${task._id}`
                                    ? "Approving..."
                                    : "Approve"}
                                </DropdownMenuItem>
                              )}
                              {task.status === "approved" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTaskAction("pause", task._id, {
                                      reason: "Admin pause",
                                    })
                                  }
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </DropdownMenuItem>
                              )}
                              {task.status === "paused" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTaskAction("resume", task._id, {
                                      reason: "Admin resume",
                                    })
                                  }
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleTaskAction("complete", task._id, {
                                    forceComplete: true,
                                    reason: "Admin completion",
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleTaskAction("delete", task._id, {
                                    reason: "Admin deletion",
                                    confirmDelete: true,
                                  })
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 px-3 sm:px-4 pb-4 gap-3">
                  <p className="text-xs sm:text-sm text-teal-600 text-center sm:text-left">
                    Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      currentPage * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount} tasks
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      {!isMobile && "Previous"}
                    </Button>
                    <span className="text-xs sm:text-sm text-teal-700 px-2">
                      Page {currentPage} of {pagination.totalPages}
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
                    >
                      {!isMobile && "Next"}
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {/* Task Details Modal */}
      <TaskDetailsModal
        open={showTaskDetails}
        onClose={() => {
          setShowTaskDetails(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}
