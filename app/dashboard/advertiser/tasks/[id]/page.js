"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Loader2,
  AlertCircle,
  Target,
  Clock,
  UserCheck,
  BarChart3,
} from "lucide-react";

export default function AdvertiserTaskDetailsPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!session?.user?.email || !params?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/tasks/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          setTask(data);
        } else {
          setError(data.message || "Failed to fetch task details");
        }
      } catch (err) {
        setError("Failed to fetch task details");
        console.error("Error fetching task details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTaskDetails();
    }
  }, [session, status, params?.id]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = task?.limitCount
    ? Math.round(((task.completedCount || 0) / task.limitCount) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Task Details</h1>
            <p className="text-sm text-muted-foreground">
              View detailed information about your campaign
            </p>
          </div>
          {/* Hidden on mobile as per navigation guidelines */}
          <Button className="hidden sm:block" onClick={() => router.back()}>
            Back to Tasks
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-teal-800">Loading task details...</span>
          </div>
        ) : task ? (
          <>
            {/* Task Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{task.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {task.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-teal-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-xl font-bold">
                        ₹
                        {task.totalCost?.toLocaleString() ||
                          task.advertiserCost?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-teal-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Submissions
                      </p>
                      <p className="text-xl font-bold">
                        {task.completedCount || 0} / {task.limitCount || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-teal-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="text-xl font-bold">
                        {task.startAt
                          ? new Date(task.startAt).toLocaleDateString()
                          : "N/A"}{" "}
                        -{" "}
                        {task.endAt
                          ? new Date(task.endAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-teal-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Per User</p>
                      <p className="text-xl font-bold">
                        ₹{task.rateToUser?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Task Progress
                </CardTitle>
                <CardDescription>
                  Track the completion of your campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion Rate</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Assigned</p>
                      <p className="font-bold">{task.assignedCount || 0}</p>
                    </div>
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="font-bold">{task.completedCount || 0}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="font-bold">
                        {Math.max(
                          0,
                          (task.limitCount || 0) - (task.completedCount || 0)
                        )}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Success Rate
                      </p>
                      <p className="font-bold">
                        {task.limitCount
                          ? Math.round(
                              ((task.completedCount || 0) /
                                (task.limitCount || 1)) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Task Requirements
                </CardTitle>
                <CardDescription>
                  What users need to complete for this task
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.requirements &&
                  Array.isArray(task.requirements) &&
                  task.requirements.length > 0 ? (
                    task.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-card border rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                        <p>{req}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No specific requirements provided
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Key metrics for your campaign performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-teal-600">
                      {((task.completedCount || 0) * 10).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estimated Clicks
                    </p>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      ₹
                      {(task.rateToUser
                        ? task.rateToUser * (task.completedCount || 0)
                        : 0
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Spent</p>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {progressPercentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Conversion Rate
                    </p>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{task.rateToUser?.toLocaleString() || "0"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Per Submission
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            {task.targetAudience && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Target Audience
                  </CardTitle>
                  <CardDescription>
                    Demographics and preferences for this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Age Group</p>
                      <p className="font-medium">
                        {task.targetAudience.ageGroup || "All Ages"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">
                        {task.targetAudience.gender || "All Genders"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">
                        {task.targetAudience.location || "All Locations"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/dashboard/advertiser/analytics?task=${task._id}`
                  )
                }
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              {task.status === "active" && (
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Pause Task
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Task not found
            </h3>
            <p className="text-muted-foreground mb-4">
              The requested task could not be found.
            </p>
            <Button
              onClick={() => router.push("/dashboard/advertiser/active-tasks")}
            >
              Back to Active Tasks
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
