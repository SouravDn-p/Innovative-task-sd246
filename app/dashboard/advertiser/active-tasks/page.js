"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

export default function ActiveTasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchActiveTasks = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      // Fetch tasks created by this advertiser
      const response = await fetch(
        `/api/tasks?gmail=${encodeURIComponent(
          session.user.email
        )}&status=approved,pending,active`
      );
      const data = await response.json();

      if (response.ok) {
        setActiveTasks(data);
      } else {
        setError(data.message || "Failed to fetch tasks");
      }
    } catch (err) {
      setError("Failed to fetch tasks");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchActiveTasks();
    }
  }, [session, status]);

  const filteredTasks = activeTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter === "all" || task.status === filter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Loading...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Calculate stats from the tasks
  const totalActiveTasks = activeTasks.filter(
    (task) => task.status === "active" || task.status === "approved"
  ).length;
  const totalBudget = activeTasks.reduce(
    (sum, task) => sum + (task.totalCost || 0),
    0
  );
  const totalSubmissions = activeTasks.reduce(
    (sum, task) => sum + (task.completedCount || 0),
    0
  );

  // Calculate average approval rate (simplified)
  const avgApprovalRate =
    totalActiveTasks > 0
      ? Math.round((totalSubmissions / (totalActiveTasks * 10)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Active Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Manage your ongoing campaigns
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/advertiser/create-task")}
          >
            Create New Task
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {totalActiveTasks}
              </div>
              <div className="text-xs text-muted-foreground">Active Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                ₹{totalBudget.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Budget</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {avgApprovalRate}
              </div>
              <div className="text-xs text-muted-foreground">
                Avg Approval %
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalSubmissions}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Submissions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={fetchActiveTasks}
              >
                <Filter className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-teal-800">Loading tasks...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error loading tasks
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={fetchActiveTasks}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Active Tasks List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Card
                  key={task._id}
                  className="border-teal-200 hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {task.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Budget</p>
                        <p className="text-lg font-bold">
                          ₹{(task.totalCost || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Spent: ₹
                          {(
                            (task.totalCost || 0) -
                              task.advertiserCost *
                                (task.limitCount -
                                  (task.completedCount || 0)) || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Clicks</p>
                        <p className="text-lg font-bold">
                          {(task.completedCount || 0) * 10}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.rateToUser
                            ? (
                                ((task.completedCount || 0) * 10) /
                                task.rateToUser
                              ).toFixed(1)
                            : "0"}{" "}
                          per ₹10
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Submissions</p>
                        <p className="text-lg font-bold">
                          {task.completedCount || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.limitCount
                            ? Math.round(
                                ((task.completedCount || 0) / task.limitCount) *
                                  100
                              )
                            : 0}
                          % completion
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Timeline</p>
                        <p className="text-xs">
                          {new Date(task.startAt).toLocaleDateString()} -{" "}
                          {new Date(task.endAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/dashboard/advertiser/tasks/${task._id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/advertiser/analytics?task=${task._id}`
                          )
                        }
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No tasks found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filter !== "all"
                      ? "No tasks match your current filters."
                      : "You haven't created any tasks yet."}
                  </p>
                  <Button
                    onClick={() =>
                      router.push("/dashboard/advertiser/create-task")
                    }
                  >
                    Create Your First Task
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
