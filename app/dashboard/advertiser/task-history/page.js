"use client";

import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function TaskHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [taskHistory, setTaskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch completed tasks for the advertiser
  useEffect(() => {
    const fetchTaskHistory = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        // Fetch completed tasks created by this advertiser
        const response = await fetch(
          `/api/tasks?gmail=${encodeURIComponent(
            session.user.email
          )}&status=completed`
        );
        const data = await response.json();

        if (response.ok) {
          // Transform the data to match the expected format
          const transformedTasks = data.map((task) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            budget: task.advertiserCost * task.limitCount,
            spent: task.rateToUser * (task.completedCount || 0),
            clicks: (task.completedCount || 0) * 10, // Approximation
            status: task.status,
            startDate: new Date(task.startAt).toISOString().split("T")[0],
            endDate: new Date(task.endAt).toISOString().split("T")[0],
            submissions: task.completedCount || 0,
            approvalRate:
              task.limitCount > 0
                ? Math.round(
                    ((task.completedCount || 0) / task.limitCount) * 100
                  )
                : 0,
          }));
          setTaskHistory(transformedTasks);
        } else {
          setError(data.message || "Failed to fetch task history");
        }
      } catch (err) {
        setError("Failed to fetch task history");
        console.error("Error fetching task history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTaskHistory();
    }
  }, [session, status]);

  // Filter tasks based on search term, status, and date
  const filteredTasks = taskHistory.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const completedTasksCount = taskHistory.length;
  const totalSpent = taskHistory.reduce(
    (sum, task) => sum + (task.spent || 0),
    0
  );
  const totalSubmissions = taskHistory.reduce(
    (sum, task) => sum + (task.submissions || 0),
    0
  );
  const avgApprovalRate =
    taskHistory.length > 0
      ? Math.round(
          taskHistory.reduce((sum, task) => sum + (task.approvalRate || 0), 0) /
            taskHistory.length
        )
      : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Task History</h1>
            <p className="text-sm text-muted-foreground">
              View your completed and past campaigns
            </p>
          </div>
          <Button
            onClick={() =>
              router.push("/dashboard/advertiser/create-from-template")
            }
          >
            Create New Task
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-teal-800">Loading task history...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error loading task history
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Stats Overview */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {completedTasksCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Completed Tasks
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">
                    ₹{totalSpent.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Spent
                  </div>
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
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => window.location.reload()}
                  >
                    <Filter className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Task History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                ₹{task.budget?.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Spent: ₹{task.spent?.toLocaleString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {task.clicks?.toLocaleString()} clicks
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {task.approvalRate}% approval
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{task.submissions}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.charAt(0).toUpperCase() +
                                task.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {task.startDate} to {task.endDate}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/advertiser/analytics?task=${task.id}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No task history found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "No tasks match your current filters."
                        : "You haven't completed any tasks yet."}
                    </p>
                    <Button
                      onClick={() =>
                        router.push(
                          "/dashboard/advertiser/create-from-template"
                        )
                      }
                    >
                      Create Your First Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
